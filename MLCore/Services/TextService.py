import os

from minio import Minio
import logging
from Processors import IDataProcessor
from Processors.TextProcessor import TextProcessor
from Processors.ImageProcessor import ImageProcessor
from pymongo.collection import Collection
from service_interfaces import IDataService
from PIL import Image
import sys
import fitz
sys.path.insert(0, './MLCore/utils')
from utils.get_console_logger import get_console_logger


logger = get_console_logger(
    __name__,
    logging.DEBUG
)



class TextService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = TextProcessor,
            num_of_insts: int = 1,
            mongo_collection: Collection = None,
            minio_client: Minio = None,
            ):
        if mongo_collection is None:
            raise ValueError('db not found')

        self.mongo_collection = mongo_collection
        self.minio_client = minio_client
        self.num_of_insts = num_of_insts
        self.worker = proc_cls()

        logger.info('Text Service ')

    def update_collection_file(self, uuid: str):

        document = self.mongo_collection.find_one({'_id': uuid})

        local_file_path = f'./{document["bucket"]}_{document["path"][1:]}'

        self.minio_client.fget_object(
            document['bucket'],
            document['path'],
            local_file_path
        )

        proc_list, pages = self.worker.process(local_file_path)

        img_filenames = self.__process_images_in_file(local_file_path)
        img_embedddings = []

        logger.info(f'images in pdf: {len(img_filenames)}')

        if len(img_filenames) > 0:
            img_proc = ImageProcessor()
            for filename in img_filenames:
                embeddings = img_proc.process(
                    Image.open(
                        filename
                    )
                )
                if embeddings:
                    img_embedddings.append(embeddings)
                os.remove(filename)

        os.remove(local_file_path)

        upd_query = {
            '$set':
            {
                'ml_data': {
                    'text_repr': proc_list,
                    'page_number': pages,
                    'img_repr': img_embedddings
                }
            }
        }

        self.mongo_collection.update_one(
            {'_id': document['_id']}, upd_query
        )

    def __process_images_in_file(self, local_file_path):
        pdf_document = fitz.open(local_file_path)
        img_filenames = []

        for page_number in range(pdf_document.page_count):
            page = pdf_document.load_page(page_number)
            image_list = page.get_images(full=True)
            
            for image_index, image_info in enumerate(image_list):
                xref = image_info[0]
                base_image = pdf_document.extract_image(xref)
                image_bytes = base_image["image"]
                
                image_filename = f'image_{page_number}_{image_index}.png'
                image_file = open(image_filename, 'wb')
                image_file.write(image_bytes)
                image_file.close()
                img_filenames.append(image_filename)

        pdf_document.close()
        return img_filenames

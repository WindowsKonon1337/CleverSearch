import os

import sys
sys.path.insert(1, 'MLCore/')
sys.path.insert(2, 'MLCore/Services')
sys.path.insert(3, 'MLCore/Processors')

from minio import Minio
from Processors import IDataProcessor
from Processors.AudioProcessor import AudioProcessor
from pymongo.collection import Collection
from service_interfaces import IDataService


class AudioService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = AudioProcessor,
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

    def update_collection_file(self, uuid: str) -> bool:

        document = self.mongo_collection.find_one({'_id': uuid})

        local_file_path = f'./{document["bucket"]}_{document["path"][1:]}'

        self.minio_client.fget_object(
            document['bucket'],
            document['path'],
            local_file_path
        )

        proc_list, timestamps = self.worker.process(local_file_path)

        os.remove(local_file_path)

        if len(proc_list):
            upd_query = {
                '$set':
                {
                    'ml_data': {
                        'text_repr': proc_list,
                        'timestart': list(map(lambda x: int(x), timestamps))
                    }
                }
            }

            self.mongo_collection.update_one(
                {'_id': document['_id']}, upd_query
            )

            return True
        else:
            return False

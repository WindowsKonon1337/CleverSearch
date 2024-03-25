import whisper
from IDataProcessor import IDataProcessor
from TextProcessor import TextProcessor


class AudioProcessor(IDataProcessor):
    def __init__(self):
        self.model = whisper.load_model("base")

    def process(self, filename):
        transcript = self.model.transcribe(filename)

        embeddings = []
        timestamps = []

        text_processor = TextProcessor()

        for element in transcript['segments']:
            embedding = text_processor.process_query_string(element['text'])
            if embedding:
                embeddings.append(embedding)
                timestamps.append(element['start'])

        return embeddings, timestamps

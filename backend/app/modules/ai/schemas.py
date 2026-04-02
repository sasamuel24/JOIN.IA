from pydantic import BaseModel


class AIAssistRequest(BaseModel):
    action: str          # improve | expand | shorten | rephrase | generate | fix
    prompt: str          # user instruction or text to process
    existing_text: str | None = None  # current text in the field (context)


class AIAssistResponse(BaseModel):
    result: str
    action: str

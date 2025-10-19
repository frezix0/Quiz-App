from fastapi import HTTPException, status

class QuizNotFoundException(HTTPException):
    def __init__(self, quiz_id: int = None):
        detail = f"Quiz dengan id {quiz_id} tidak ditemukan." if quiz_id else "Quiz tidak ditemukan."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= detail
        )

class QuestionNotFoundException(HTTPException):
    def __init__(self, question_id: int = None):
        detail = f"Pertanyaan dengan id {question_id} tidak ditemukan." if question_id else "Pertanyaan tidak ditemukan."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= detail
        )

class AttemptNotFoundException(HTTPException):
    def __init__(self, attempt_id: int = None):
        detail = f"Attempt quiz dengan id {attempt_id} tidak ditemukan." if attempt_id else "Attempt quiz tidak ditemukan."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= detail
        )

class QuizAlreadyCompletedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= "Quiz sudah selesai dan tidak dapat diubah."
        )

class InvalidQuizDataException(HTTPException):
    def __init__(self, message: str = "Data quiz tidak valid."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= message
        )

class DatabaseException(HTTPException):
    def __init__(self, message: str = "Terjadi kesalahan pada database."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail= message
        )

class ValidationException(HTTPException):
    def __init__(self, message: str = "Validasi data gagal."):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail= message
        )
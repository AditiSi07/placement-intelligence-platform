from typing import Any, Optional

def success_response(data: Any, message: str = "Success"):
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def error_response(message: str, code: int = 400):
    return {
        "status": "error",
        "message": message,
        "data": None
    }
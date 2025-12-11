import pyodbc
import os

def get_connection():
    try:
        conn = pyodbc.connect(
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
            f"DATABASE={os.getenv('AZURE_SQL_DATABASE')};"
            f"UID={os.getenv('AZURE_SQL_USER')};"
            f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
            "Encrypt=yes;TrustServerCertificate=no;"
        )
        print("DB Connection Successful!")  # temporary debug line
        return conn

    except Exception as e:
        print("\n\n🔥🔥 DATABASE CONNECTION ERROR 🔥🔥")
        print("Server:", os.getenv('AZURE_SQL_SERVER'))
        print("Database:", os.getenv('AZURE_SQL_DATABASE'))
        print("User:", os.getenv('AZURE_SQL_USER'))
        print("Password:", os.getenv('AZURE_SQL_PASSWORD'))
        print("Error:", e)
        print("-------------------------------------------------\n\n")
        raise e  # important: DO NOT return None

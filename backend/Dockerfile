FROM python:3.9-slim

WORKDIR /app

# 🔧 Instalar herramientas de compilación para paquetes con C
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 📦 Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 📄 Copiar el código de la app
COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
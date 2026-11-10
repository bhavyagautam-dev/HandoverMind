FROM python:3.12-slim

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN addgroup --system django && \
    adduser --system --ingroup django django && \
    mkdir -p /app/staticfiles && \
    chown -R django:django /app

USER django

# Container port
EXPOSE 8000

# Start Django application
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]

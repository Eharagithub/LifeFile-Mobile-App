from setuptools import setup, find_packages

setup(
    name="multigenetic_healthcare",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic",
        "aiohttp",
    ],
)
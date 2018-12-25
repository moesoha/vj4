# `stage-node` generates some files
FROM node:8-stretch AS stage-node
ADD . /app/src
WORKDIR /app/src
RUN npm install \
    && npm run build:production

# main
FROM python:3.6-stretch
COPY --from=stage-node /app/src /app/src
WORKDIR /app/src

RUN apt-get update && \
    apt-get install -y \
        libmaxminddb0 mmdb-bin libmaxminddb-dev && \
    apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* && \
    python3 -m pip install -r requirements.txt && \
    curl "http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz" | \
        gunzip -c > GeoLite2-City.mmdb

ENV VJ_LISTEN=http://0.0.0.0:8888

ADD docker-entrypoint.py /app/src/
ENTRYPOINT [ "python3", "docker-entrypoint.py" ]

EXPOSE 8888
CMD [ "vj4.server" ]

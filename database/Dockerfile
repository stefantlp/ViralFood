FROM postgres:16
COPY init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY seed_data.sql /docker-entrypoint-initdb.d/02-seed.sql
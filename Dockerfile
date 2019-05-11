FROM node:8

WORKDIR /jos/botbot

COPY . /jos/botbot

#RUN chmod 777 /jos/tester/attachstorage.sh
#RUN apt-get update
#RUN apt-get install cifs-utils
#RUN /jos/tester/attachstorage.sh

ENTRYPOINT [ "node",  "bot.js" ]
#ENTRYPOINT [ "bash" ]

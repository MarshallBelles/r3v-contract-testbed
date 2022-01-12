FROM ubuntu

RUN sh -ci "$(curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -)"

RUN apt-get update -y

ARG DEBIAN_FRONTEND=noninteractive

RUN  apt install curl nodejs npm build-essential -y

WORKDIR /contract-testbed

ADD . .

RUN curl https://storage.googleapis.com/flow-cli/flow-x86_64-linux-v0.28.1 > /usr/bin/flow

RUN chmod +x /usr/bin/flow

ENV PATH="/usr/bin:/usr/bin/npm"

RUN cd /contract-testbed && npm i

ENTRYPOINT [ "npm", "run", "test:ci" ]
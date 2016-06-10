FROM mhart/alpine-node:5
MAINTAINER <%= botOwner %>

WORKDIR /usr/src
VOLUME /usr/src/scripts

# Install OS Dependencies
RUN apk add --update bash git openssh \
  && npm install -g nodemon \
  && npm install

# Install Filesystem
COPY . .

EXPOSE 8080

# Set env vars when linking containers for dev
ENTRYPOINT ["bin/_entry.sh"]
CMD ["--adapter", "<%= botAdapter %>"]

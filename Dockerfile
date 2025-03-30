# Dockerfile

# ----------------- Stage 1: Build dependencies ----------------- 
# This specifies the parent (or base) image to use as a starting point for our own image. 
# Our fragments image will be based on other Docker images. This helps us avoid duplicating work across projects
# https://docs.docker.com/reference/dockerfile/#from
FROM node:22.12.0 AS build

# Use /app as our working directory
# https://docs.docker.com/reference/dockerfile/#workdir
WORKDIR /app

# https://docs.docker.com/reference/dockerfile/#copy
# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
#COPY package*.json /app/
#
# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
#COPY package*.json ./
#
# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./

# Install all the production dependencies using the package-lock.json file
RUN npm ci --only=production

# ----------------- Stage 2: Create a lightweight production image ----------------- 
FROM node:22.12.0-alpine3.19 AS production

# adds key=value pairs with arbitrary metadata about your image
# indicating who is maintaining this image, and what this image is for
# https://docs.docker.com/reference/dockerfile/#label
LABEL maintainer="Ashwin B N <ashwinbn10@gmail.com>"\
      description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the NODE_ENV to production 
# so that some optimizations are applied automatically to run in production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copying over the node_modules folder from the 'build' stage
# Also copy the package files to the working directory
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/package-lock.json ./

# Copy the rest of the application source code into the app/src directory
# Also copy over the .htpasswd file to run the container using basic auth
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# We run our service on port 8080
# We use EXPOSE in order to indicate the port(s) that a container will listen on when run 
# For example, a web server might EXPOSE 80, indicating that port 80 is the typical port used by this container.
EXPOSE ${PORT}

# Health check configuration
HEALTHCHECK --interval=60s --timeout=60s --start-period=10s \
    CMD curl --fail http://localhost:${PORT}/ || exit 1

# Start the container by running our server
# https://docs.docker.com/reference/dockerfile/#cmd
CMD ["node", "src/index.js"]

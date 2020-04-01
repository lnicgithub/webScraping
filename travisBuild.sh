# TravisBuild script for building multi arch docker images and deploying them to Heroku

# context form https://nexus.eddiesinentropy.net/2020/01/12/Building-Multi-architecture-Docker-Images-With-Buildx/

# set some parameters for Docker. Platforms must be space delimited.
IMAGE_NAME='lnicdockerhub/app'
VERSION=latest
CI_NAME=travis
export DOCKER_PLATFORMS='linux/amd64'
DOCKER_PLATFORMS+=' linux/arm/v6'

# Setup BuildX Environment. Using Ubuntu as it is multi arch so we can build differnt platforms
sudo rm -rf /var/lib/apt/lists/*
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) edge"
sudo apt-get update

# Installing Docker-ce which includes buildx
sudo apt-get -y -o Dpkg::Options::="--force-confnew" install docker-ce

# Setting docker experimental to true within docker-ce
local -r config='/etc/docker/daemon.json'
  if [[ -e "$config" ]]; then
    sudo sed -i -e 's/{/{ "experimental": true, /' "$config"
  else
    echo '{ "experimental": true }' | sudo tee "$config"
  fi

# Must restart after enabling experimental so buildx can see multi archs
sudo systemctl restart docker

# Must run qemu-user-static to allow us to startup buildx
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
export DOCKER_CLI_EXPERIMENTAL=enabled

# Create the builder and then we must inspect it to ensure its running correctly.
docker buildx create --name mybuilder
docker buildx use mybuilder
docker buildx inspect --bootstrap

# Login to Docker - Parameters stored in Travis
docker login -u "$DOCKER_USER" -p "$DOCKER_PASSWORD"

# Run docker buildx passing in the platforms.
docker buildx build \
    --platform "${DOCKER_PLATFORMS// /,}" \
    --push \
    --progress plain \
    -f Dockerfile \
    -t ${IMAGE_NAME}:${VERSION}-${CI_NAME} \
    .

# Heroku Deploy
# install heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

#Login to Heroku private docker registry
docker login --username=_ --password="$HEROKU_API_KEY" registry.heroku.com

#Pull our image we built earlier to the local travis env.
docker pull ${IMAGE_NAME}:${VERSION}-${CI_NAME}

#Tag the local image to Heroku
docker tag ${IMAGE_NAME}:${VERSION}-${CI_NAME} registry.heroku.com/$HEROKU_APP_NAME/web

#Push it to Heroku
docker push registry.heroku.com/$HEROKU_APP_NAME/web

#Release to Heroku
/usr/local/bin/heroku container:release web --app $HEROKU_APP_NAME

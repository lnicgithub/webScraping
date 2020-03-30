export DOCKER_PLATFORMS='linux/amd64'
DOCKER_PLATFORMS+=' linux/arm64'
DOCKER_PLATFORMS+=' linux/arm/v6'
BUILDX_VER=v0.3.0
IMAGE_NAME=lnicdockerhub/app
VERSION=latest
CI_NAME=travis

sudo rm -rf /var/lib/apt/lists/*
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) edge"
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confnew" install docker-ce

local -r config='/etc/docker/daemon.json'
  if [[ -e "$config" ]]; then
    sudo sed -i -e 's/{/{ "experimental": true, /' "$config"
  else
    echo '{ "experimental": true }' | sudo tee "$config"
  fi
sudo systemctl restart docker

docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
export DOCKER_CLI_EXPERIMENTAL=enabled
docker buildx create --name mybuilder
docker buildx use mybuilder
# Start up buildx and verify that all is OK.
docker buildx inspect --bootstrap
docker login -u "$DOCKER_USER" -p "$DOCKER_PASSWORD"

docker buildx build \
    --platform "${DOCKER_PLATFORMS// /,}" \
    --push \
    --progress plain \
    -f Dockerfile \
    -t ${IMAGE_NAME}:${VERSION}-${CI_NAME} \
    .


# mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
# curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
# chmod a+x ~/.docker/cli-plugins/docker-buildx

# docker run --rm --privileged multiarch/qemu-user-static:register --reset -p yes
# docker buildx create --use
# docker buildx inspect --bootstrap
# docker buildx build --push \
# 		--build-arg CI_NAME=${CI_NAME} \
# 		--platform linux/arm/v7,linux/arm64/v8,linux/386,linux/amd64 \
# 		-t ${IMAGE_NAME}:${VERSION}-${CI_NAME} .


# Build for amd64 and push
# buildctl build --frontend dockerfile.v0 \
#             --local dockerfile=. \
#             --local context=. \
#             --exporter image \
#             --exporter-opt name=lnicdockerhub/app:test-build-amd64 \
#             --exporter-opt push=true \
#             --frontend-opt platform=linux/amd64 \
#             --frontend-opt filename=./Dockerfile


# # Build for armhf and push
# buildctl build --frontend dockerfile.v0 \
#             --local dockerfile=. \
#             --local context=. \
#             --exporter image \
#             --exporter-opt name=lnicdockerhub/app:test-build-armhf \
#             --exporter-opt push=true \
#             --frontend-opt platform=linux/arm64 \
#             --frontend-opt filename=./Dockerfile




export DOCKER_CLI_EXPERIMENTAL=enabled
BUILDX_VER=v0.3.0
IMAGE_NAME=lnicdockerhub/app
VERSION=latest
CI_NAME=travis

mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
chmod a+x ~/.docker/cli-plugins/docker-buildx

docker buildx create --use
docker buildx inspect --bootstrap
docker buildx build --push \
		--build-arg CI_NAME=${CI_NAME} \
		--platform linux/arm/v7,linux/arm64/v8,linux/386,linux/amd64 \
		-t ${IMAGE_NAME}:${VERSION}-${CI_NAME} .


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




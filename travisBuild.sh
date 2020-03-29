# Login into docker
docker login --username $DOCKER_USER --password $DOCKER_PASSWORD

# Build for amd64 and push
buildctl build --frontend dockerfile.v0 \
            --local dockerfile=. \
            --local context=. \
            --exporter image \
            --exporter-opt name=lnicdockerhub/app:test-build-amd64 \
            --exporter-opt push=true \
            --frontend-opt platform=linux/amd64 \
            --frontend-opt filename=./Dockerfile


# Build for armhf and push
buildctl build --frontend dockerfile.v0 \
            --local dockerfile=. \
            --local context=. \
            --exporter image \
            --exporter-opt name=lnicdockerhub/app:test-build-armhf \
            --exporter-opt push=true \
            --frontend-opt platform=linux/arm64 \
            --frontend-opt filename=./Dockerfile


export DOCKER_CLI_EXPERIMENTAL=enabled

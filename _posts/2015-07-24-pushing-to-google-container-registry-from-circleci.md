---
layout: post
title: Pushing to Google Container Registry from CircleCI
date: '2015-07-24 19:36'
---

[CircleCI](https://circleci.com) is a great build tool with a lot of flexibility. They even have a good [tutorial on interacting with docker](https://circleci.com/docs/docker) with a [special section](https://circleci.com/docs/docker#google-compute-engine-and-kubernetes) referencing Google Compute Engine and Kubernetes. The only slight difference here is that I want to deploy directly to [Google's Container Registry](https://cloud.google.com/container-registry/) (GCR) rather than deploy my own registry, which is slightly more involved. So, let's get started.

Our starting point is [circleci/docker-hello-google](https://github.com/circleci/docker-hello-google), then a little help from this fork [bellkev/docker-hello-google](https://github.com/bellkev/docker-hello-google). These repos handle a lot of the other aspects of building a docker image, running, and testing it.

From the command line, it is really easy to [push docker images to the GCR](https://cloud.google.com/container-registry/#pushing_to_the_registry).

For example:
```sh
docker tag user/example-image gcr.io/your-project-id/example-image
gcloud docker push gcr.io/your-project-id/example-image
```

However, in a build environment, we can't just use `gcloud auth login` with our Google credentials. We need to first [set up a service account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount). You will need the email address and downloaded json file `project_name-xxxxx.json`.

Once you've created your service account, set up the following environment variables in CircleCI:

| name                       | value                                                  |
|:---------------------------|:-------------------------------------------------------|
| GCLOUD_EMAIL               | `{string_of_characters}@developer.gserviceaccount.com` |
| GCLOUD_KEY                 | base64-encoded version of `project_name-xxxxx.json`    |
| EXTERNAL_REGISTRY_ENDPOINT | `us.gcr.io/{project-id}`                               |

On OSX and Linux, you can get the base64 encoded version like this:

```sh
cat project_name-xxxxx.json | base64
```

Now we can write a script that authenticates us with `gcloud` and name it `script/auth-gcloud.sh`:

```sh
#! /bin/bash
echo $GCLOUD_KEY | base64 --decode > gcloud.p12
gcloud auth activate-service-account $GCLOUD_EMAIL --key-file gcloud.p12
ssh-keygen -f ~/.ssh/google_compute_engine -N ""
```

Now we just need to set up the `circle.yml` with the following sections:

Here, the `CLOUDSDK_*` environment variables help with non-interactive use of the `gcloud` cli.

```yaml
machine:
  environment:
    CLOUDSDK_CORE_DISABLE_PROMPTS: 1
    CLOUDSDK_PYTHON_SITEPACKAGES: 1
    CLOUDSDK_COMPUTE_ZONE: us-central1-b
    CLOUDSDK_CORE_PROJECT: $GCLOUD_PROJECTID
    PATH: $PATH:/home/ubuntu/google-cloud-sdk/bin
  python:
    version: 2.7.3
  services:
    - docker
```

Check out [script/ensure-gcloud-installed.sh here](https://github.com/smerchek/docker-hello-google/blob/master/script/ensure-gcloud-installed.sh). We build the docer image using our `$EXTERNAL_REGISTRY_ENDPOINT` and the `$CIRCLE_SHA1` and use the standard CircleCI method of caching docker layers.

```yaml
dependencies:
  cache_directories:
    - ~/google-cloud-sdk
    - ~/docker
  override:
    - script/ensure-gcloud-installed.sh
    - if [[ -e ~/docker/image.tar ]]; then docker load -i ~/docker/image.tar; fi
    - docker build -t $EXTERNAL_REGISTRY_ENDPOINT/hello:$CIRCLE_SHA1 .
    - mkdir -p ~/docker; docker save $EXTERNAL_REGISTRY_ENDPOINT/hello:$CIRCLE_SHA1 > ~/docker/image.tar
```

Next, we use our script from above to authenticate with gcloud, then use the `gcloud docker push` almost like normal. I had to add `> /dev/null` to ignore the output as it was causing the following error: _FATA[0061] HTTP code 500 while uploading metadata: "invalid character 'I' looking for beginning of value"_

```yaml
deployment:
  prod:
    branch: master
    commands:
      - script/auth-gcloud.sh
      - gcloud docker push $EXTERNAL_REGISTRY_ENDPOINT/hello > /dev/null
```

The working code for this example can be found at [my fork](https://github.com/smerchek/docker-hello-google). I imagine these same principles can be applied to push docker images to Google Cloud Registry from other build tools like Jenkins or TravisCI.
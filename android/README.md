# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

Steps to setup pipeline locally

1. Copy Google Store Keys & staging and/or production app Android Signing keys into `android/fastlane/key` folder
2. If you have different key name other than the one in `Appfile`, replace name of the key json with your Google Store key name
3. Copy `keystore-staging.properties` and/or `keystore-production.properties` and place them into `android` folder
4. `cp .env.example .env.staging && cp .env.example .env.production` and fill in relevant info

# Available Actions

## Android

### Build an Apk file for virtual device debugging

[**Staging App**]

```sh
yarn build:android
```

[**Production App**]

```sh
yarn build:prod:android
```

### Publish internal build

[**Staging App**]

```sh
yarn deploy:android
```

[**Production App**]

```sh
yarn deploy:prod:android
```

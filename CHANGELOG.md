# ffux version changes 

## 0.8.2

* Remove non-needed merge when updating Listener component state (caused some live-reloading bugs sometimes)


## 0.8.1

* Fix dispatcher stopping bug during Listener-component hot loading


## 0.8.0

* Add way to stop dispatcher event listening
* Add hot loading support with `<Listener>` component
* Fix RxJs `createStore` example 


## 0.7.0

* Stores are now event streams
* Fixed `ffux.update` pattern argument passing from `ffux/rx`
* Support passing any kind of dependencies instead of just stores


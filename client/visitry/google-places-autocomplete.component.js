import {logger} from '/client/logging'

'use strict';
/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 * with a hack to make it work despite the google autocomplete bug that
 * causes it to fail intermittantly on ios mobile cordova apps
 *
 * Usage:
 *
 * <input type="text" ng-google-places-autocomplete-hack id="locationInput" ng-model="location" details="details" data-tap-disabled="true"/>
 *
 * + ng-model - autocomplete textbox value
 *
 * + details - more detailed location result, includes address parts, latlng,
 * + options - configuration for the autocomplete (Optional)
 *
 *       + country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete
 * example:
 *
 *    options = {
 *        watchEnter: true,
 *        country: 'us'
 *    }
 *
 **/

angular.module("visitry")
  .directive('ngGooglePlacesAutocompleteHack', function ($timeout) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '=',
        ngProgress: '='
      },

      link: function (scope, element, attrs, controller) {
        var sessionToken = ''
        var watchEnter = true;
        var opts = {};
        if (scope.options !=null) {

          if (scope.options.watchEnter !== true) {
            watchEnter = false
          } else {
            watchEnter = true
          }
          if (scope.options.country) {
            opts.componentRestrictions = {
              country: scope.options.country
            }
          }
        }
        // for progress indicator while typing
        var inputChangedPromise;
        var keystrokeListener = function () {
          scope.ngProgress = true;
          if(inputChangedPromise){
            $timeout.cancel(inputChangedPromise);
          }
          inputChangedPromise = $timeout(stopProgress,2000);
        };
        function stopProgress() {
          scope.ngProgress = false;
        }
        element.bind('keyup', keystrokeListener);

        $timeout(function() { //execute function after DOM renders
          // google's place autocomplete
          scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
          scope.gPlace.setFields(['address_component', 'adr_address', 'alt_id', 'formatted_address', 'geometry', 'icon', 'id', 'name', 'place_id', 'scope', 'type', 'vicinity'])
          if (opts.componentRestrictions) {
            scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
          }

          //handle place-changed fired by AutoComplete
          var listener = (scope.gPlace).addListener('place_changed', function () {
            scope.ngProgress = false;
            var result = scope.gPlace.getPlace();
            if (result !== undefined) {
              if (result.address_components !== undefined) {
                scope.$apply(function () {
                  scope.ngModel = result.name + ", " + result.vicinity;
                  scope.details = result;
                });
              } else {
                if (watchEnter) {
                  getPlace(result);
                }
              }
            }
          });
        });

        //function to get retrieve the drop-down's first result using the AutocompleteService
        var getPlace = function (result) {
          console.log('getting place')
          var autocompleteService = new google.maps.places.AutocompleteService();
          sessionToken = sessionToken ? sessionToken : new google.maps.places.AutocompleteSessionToken()
          if (result.name.length > 0) {
            scope.ngProgress = true;
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length,
                sessionToken
              },
              function listentoresult(list, status) {
                if ( status == google.maps.places.PlacesServiceStatus.OK) {
                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'placeId': list[0].place_id,
                      fields: ['address_component', 'adr_address', 'alt_id', 'formatted_address', 'geometry', 'icon', 'id', 'name', 'place_id', 'scope', 'type', 'vicinity'],
                      sessionToken
                    },
                    function detailsresult(detailsResult, placesServiceStatus) {
                      console.log(detailsResult)
                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function () {
                          scope.ngModel = detailsResult.name + ", " + detailsResult.vicinity;
                          scope.details = detailsResult;
                        });
                      } else {
                        logger.error(" from PlacesService: " + placesServiceStatus)
                      }
                    }
                  );
                }
                else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
                  alert( "Could not find location for " + result.name + ". Please edit and try again.")
                  logger.error("No results from PlacesService looking for " + result.name );
                  scope.$apply(function () {
                    scope.details = null;
                  });
                }
                else {
                  logger.error("Error: " + status + " from PlacesService looking for " + selectedPlaceName );
                  alert(status);
                  return;
                }
                scope.ngProgress = false;
              }
            );
          }
        };

        // on ios the place-changed does not always get fired due to interference
        // from ionic and cordova
        // This is a hack to get the place when a click occurs that has not fired the place-changed.
        // (We know it didn't fire because the click gets bubbled up to pac-container when it isn't handled.)
        // We get the text of the selected item and ask for the details from google again

        // Also, on first load sometimes the pac-Container is not yet there to attach listener to
        // using this in a timeout waits to attach a the getPlaceDetails to the pac-containers

        $timeout(function() {
          var container = document.getElementsByClassName('pac-container');
          // disable ionic data tab - (needed for google autocomplete to work with ionic)
          for(var i=0; i < container.length; i++) {
            var eachPacContainer = document.getElementsByClassName('pac-container')[i];
            var setting = angular.element(eachPacContainer).attr('data-tap-disabled');
            if (setting == undefined) {
              angular.element(eachPacContainer).attr('data-tap-disabled', 'true');
              angular.element(eachPacContainer).on("click", getPlaceDetails);
            }
          };

          var backdrop = document.getElementsByClassName('backdrop');
          angular.element(backdrop).attr('data-tap-disabled', 'true');

          var mbackdrop = document.getElementsByClassName('modal-backdrop');
          angular.element(mbackdrop).attr('data-tap-disabled', 'true');

        },500);


        var getPlaceDetails = function (e) {
          console.log('getting place details')
          var childNodes = Array.from(e.target.childNodes);
          var textArray = childNodes.map(function(childElem) {return childElem.textContent});
          var selectedPlaceName = textArray.join(" ");
          e.target.blur();
          e.stopPropagation();
          scope.ngProgress = true;
          var autocompleteService = new google.maps.places.AutocompleteService();
          sessionToken = sessionToken ? sessionToken : new google.maps.places.AutocompleteSessionToken()
          if (e.target.textContent.length > 0) {
            autocompleteService.getPlacePredictions(
              {
                input: selectedPlaceName,
                sessionToken
              },
              function listentoresult(list, status) {
                if ( status == google.maps.places.PlacesServiceStatus.OK) {
                  var placesService = new google.maps.places.PlacesService(document.createElement('div'));
                  placesService.getDetails(
                    {'placeId': list[0].place_id,
                      fields: ['address_component', 'adr_address', 'alt_id', 'formatted_address', 'geometry', 'icon', 'id', 'name', 'place_id', 'scope', 'type', 'vicinity'],
                      sessionToken
                    },
                    function detailsresult(detailsResult, placesServiceStatus) {
                      console.log(detailsResult)
                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function () {
                          scope.ngModel = detailsResult.name + ", " + detailsResult.vicinity;
                          scope.details = detailsResult;
                        });
                      } else {
                        logger.error("from PlacesService:" + placesServiceStatus);
                      }
                    }
                  );
                }
                else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
                  alert( "Could not find location for " + selectedPlaceName + ". Please try again.")
                  logger.error("No results from PlacesService looking for " + selectedPlaceName );
                  scope.$apply(function () {
                    scope.details = null;
                  });
                }
                else {
                  logger.error("Error: " + status + " from PlacesService looking for " + selectedPlaceName );
                  alert(status);
                  return;
                }
              });
          } else {
            logger.error("pac-container - no text in location field ");
          }
          scope.ngProgress = false;
         };


        scope.$on('$destroy', function () {
          scope.gPlace.unbindAll();
          google.maps.event.clearInstanceListeners(scope.gPlace);
          google.maps.event.clearInstanceListeners(element);
          scope.ngProgress = false;
        });
      }
    };
  });

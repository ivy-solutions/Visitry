import {logger} from '/client/logging'

'use strict';
/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 * with a hack to make it work despite the google autocomplete bug that
 * causes it to fail intermittantly on ios mobile cordova apps
 * - to be used in conjunction with disable-tap directive
 *
 * Usage:
 *
 * <input type="text" ng-damn-google-places-autocomplete id="locationInput" ng-model="location" details="details" disable-tap/>
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
  .directive('ngGooglePlacesAutocompleteHack', function () {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '='
      },

      link: function (scope, element, attrs, controller) {

        var watchEnter = true;
        var opts = {};
        if (scope.options !=null) {
          logger.verbose(scope.options)


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

        scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
        if (opts.componentRestrictions) {
          scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
        }

         // on ios the place-changed does not always get fired due to interference
        // from ionic and cordova
        // This is a hack to get the place when a click occurs that has not fired the place-changed.
        // (We know it didn't fire because the click gets bubbled up to pac-container when it isn't handled.)
        // We get the text of the selected item and ask for the details from google again
        var container = document.getElementsByClassName('pac-container');
        angular.element(container).on("click", function(e){
          var selectedPlaceName =  e.target.textContent;
          e.target.blur();
          var autocompleteService = new google.maps.places.AutocompleteService();
          if (e.target.textContent.length > 0) {
            autocompleteService.getPlacePredictions(
              {
                input: selectedPlaceName,
              },
              function listentoresult(list, status) {
                if (list == null || list.length == 0) {
                   scope.$apply(function () {
                    scope.details = null;
                  });
                } else {
                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'placeId': list[0].place_id},
                    function detailsresult(detailsResult, placesServiceStatus) {

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
              });
          } else {
            logger.error("pac-conatiner - no text in location field ");
          }
          e.stopPropagation();
        });


        var listener = (scope.gPlace).addListener('place_changed', function () {
          logger.verbose('place_changed');
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

        //function to get retrieve the drop-down's first result using the AutocompleteService
        var getPlace = function (result) {
          var autocompleteService = new google.maps.places.AutocompleteService();
          if (result.name.length > 0) {
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length
              },
              function listentoresult(list, status) {
                if (list == null || list.length == 0) {
                  scope.$apply(function () {
                    scope.details = null;
                  });
                } else {
                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'placeId': list[0].place_id},
                    function detailsresult(detailsResult, placesServiceStatus) {

                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function () {

                          scope.ngModel = detailsResult.name + ", " + detailsResult.vicinity;

                          scope.details = detailsResult;

                        });
                      }
                    }
                  );
                }
              });
          }
        };

        scope.$on('$destroy', function () {
          scope.gPlace.unbindAll();
          google.maps.event.clearInstanceListeners(scope.gPlace);
          google.maps.event.clearInstanceListeners(element);
        });
      }
    };
  });

var module =  angular.module('s3FileUpload', [])
  .directive('s3FileUpload',['$parse', '$q', '$http' , function($parse, $q, $http) {
               return {
                    restrict : "A",
                    scope : true,
                    controller: ['$scope', '$element', '$attrs', '$transclude' , function($scope, $element, $attrs, $transclude) {

                      //console.log("controller called of directive")

                        //status vars 
                        $scope.s3Status = {
                            success : false,
                            error : false,
                            uploading : false,
                            uploaded : false,
                            progressCount : 0,
                            path : null,
                            fileName : null,
                            targetFileName : null,
                            file: null,
                            errorMsg: null,
                            errorCode:null
                        }



                        //selecte all children
                        $scope.progressSelecter = angular.element($element[0].querySelector('s3-progress'));
                        $scope.completeSelecter = angular.element($element[0].querySelector('s3-success'));
                        $scope.errorSelecter = angular.element($element[0].querySelector('s3-error'));
                        

                        $scope.progressSelecter.css({'display': 'none'});
                        $scope.completeSelecter.css({'display': 'none'});
                        $scope.errorSelecter.css({'display': 'none'});

                        $scope.successCall = $attrs.s3SuccessCall;
                        $scope.preCall = $attrs.s3PreCall;
                        $scope.errorCall = $attrs.s3ErrorCall;





                        $scope.upload = function (scope, uri, key, acl, type, accessKey, policy, signature, file) {
                              // call pre function
                              if($scope.preCall != undefined)
                                 scope[$scope.preCall](scope.s3Status);



                              var deferred = $q.defer();
                              scope.attempt = true;
                              var fd = new FormData();
                              fd.append('key', key);
                              fd.append('acl', acl);
                              fd.append('Content-Type', file.type);
                              fd.append('AWSAccessKeyId', accessKey);
                              fd.append('policy', policy);
                              fd.append('signature', signature);
                              fd.append("file", file);


                              var xhr = new XMLHttpRequest();
                              xhr.upload.addEventListener("progress", uploadProgress, false);
                              xhr.addEventListener("load", uploadComplete, false);
                              xhr.addEventListener("error", uploadFailed, false);
                              xhr.addEventListener("abort", uploadCanceled, false);
                              scope.$emit('s3upload:start', xhr);

                              // Define event handlers
                              function uploadProgress(e) {
                                //enable loading div
                                $scope.progressSelecter.css({'display': 'block'});
                                $scope.completeSelecter.css({'display': 'none'});
                                $scope.errorSelecter.css({'display': 'none'});
                                scope.$apply(function () {
                                  if (e.lengthComputable) {
                                    scope.s3Status.progressCount = Math.round(e.loaded * 100 / e.total);
                                  } else {
                                    scope.s3Status.progressCount = 'unable to compute';
                                  }
                                  var msg = {type: 'progress', value: scope.progress};
                                  scope.$emit('s3upload:progress', msg);
                                  if (typeof deferred.notify === 'function') {
                                    deferred.notify(msg);
                                  }

                                });
                              }
                              function uploadComplete(e) {
                                var xhr = e.srcElement || e.target;
                                scope.$apply(function () {
                                  self.uploads--;
                                  scope.s3Status.uploading = false;
                                  if (xhr.status === 204) { // successful upload
                                     //enable complete div
                                        $scope.completeSelecter.css({'display': 'block'});
                                        $scope.progressSelecter.css({'display': 'none'});
                                        $scope.errorSelecter.css({'display': 'none'});

                                    //call success call
                                        if($scope.successCall != undefined)
                                        scope[$scope.successCall](e, scope.s3Status);       

                                    scope.s3Status.success = true;
                                    scope.s3Status.uploaded = true;
                                    deferred.resolve(xhr);
                                    scope.$emit('s3upload:success', xhr, {path: uri + key});
                                  } else {
                                     //enable error div
                                        $scope.completeSelecter.css({'display': 'none'});
                                        $scope.progressSelecter.css({'display': 'none'});
                                        $scope.errorSelecter.css({'display': 'block'});
                                     

                                    // call error function
                                          if($scope.errorCall != undefined)
                                             scope[$scope.errorCall](e, scope.s3Status); 


                                    $scope.s3Status.success = false;
                                    $scope.s3Status.error = true;
                                    

                                    deferred.reject(xhr);
                                    scope.$emit('s3upload:error', xhr);
                                    setErrorObj(4, "Error in Parameters provided to the AWS For Auth, So XMLHttpRequest cannot load!")
                                  }
                                });
                              }
                              function uploadFailed(e) {
                                
                                // call pre function
                              if($scope.errorCall != undefined)
                                 scope[$scope.errorCall](e, scope.s3Status);


                               


                                //enable error div
                                $scope.completeSelecter.css({'display': 'none'});
                                $scope.progressSelecter.css({'display': 'none'});
                                $scope.errorSelecter.css({'display': 'block'});
                                var xhr = e.srcElement || e.target;
                                scope.$apply(function () {
                                  self.uploads--;
                                  scope.s3Status.uploading = false;
                                  scope.s3Status.success = false;
                                  deferred.reject(xhr);
                                  scope.$emit('s3upload:error', xhr);

                                });
                                setErrorObj(4, "Error in Parameters provided to the AWS For Auth, So XMLHttpRequest cannot load!");
                              }
                              function uploadCanceled(e) {
                                var xhr = e.srcElement || e.target;
                                scope.$apply(function () {
                                  self.uploads--;
                                  scope.s3Status.uploading = false;
                                  scope.s3Status.success = false;
                                  deferred.reject(xhr);
                                  scope.$emit('s3upload:abort', xhr);
                                });
                              }

                              scope.s3Status.path = uri + key;
                              // Send the file
                              scope.s3Uploading = true;
                              this.uploads++;
                              xhr.open('POST', uri, true);
                              xhr.send(fd);

                              return deferred.promise;
                            };


                            $scope.getUploadOptions = function (uri) {
                              var deferred = $q.defer();
                              $http.get(uri).
                                success(function (response, status) {
                                  deferred.resolve(response);
                                }).error(function (error, status) {
                                  deferred.reject(error);

                                $scope.completeSelecter.css({'display': 'none'});
                                $scope.progressSelecter.css({'display': 'none'});
                                $scope.errorSelecter.css({'display': 'block'});
                                setErrorObj(5, "Error in Request to '" + uri + "' to get S3 Access information!");
                                });

                              return deferred.promise;
                            };  

                           
                           function setErrorObj (errorCode, errorMsg) {
                                 $scope.errorSelecter.css({'display': 'block'});
                                 $scope.s3Status.error = true;
                                 $scope.s3Status.errorCode = errorCode;
                                 $scope.s3Status.errorMsg = errorMsg;
                                 $scope.$apply();
                                 $scope[$scope.errorCall](null, $scope.s3Status);
                                 throw new Error($scope.s3Status.errorMsg + ' (S3 Error Code:' + $scope.s3Status.errorCode + ')');
                           }

                           $scope.setErrorObj = function(errorCode, errorMsg) {
                                 setErrorObj(errorCode, errorMsg)
                          }

                           $scope.checkValidation = function() {
                            //check if bucket present : Error Code = 1
                            if($attrs.s3FileUpload.length == 0) {
                                 setErrorObj(1, "Bucket is undefined, Please Provide a Valid Bucket Name to 's3-file-upload' attribute.");
                              }
                            //check if folder is present : Error Code = 2
                            if($attrs.s3Folder == undefined || $attrs.s3Folder.length == 0) {
                                setErrorObj(2, "Folder is undefined, Please Provide a Valid Folder Name to 's3-folder' attribute.");
                            }  
                            //check if s3Accesss is present : Error Code = 3
                            if($attrs.s3AccessUri == undefined || $attrs.s3Folder.length == 0) {
                                setErrorObj(3, "S3 Aceess Uri is undefined, Please Provide a Valid Aceess Uri location to 's3-aceess-uri' attribute.");
                            }  
                                
                            
                           } 

                            $scope.randomString = function (length) {
                                      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                      var result = '';
                                      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

                                      return result;
                                    };


                    }] ,
                    link: function (scope, el, attrs) {
                        var s3Info = {
                            uri: 'https://' + attrs.s3FileUpload + '.s3.amazonaws.com/',
                            key: null,
                            acl: 'public-read',
                            type: null,
                            accessKey: null,
                            policy: null,
                            signature: null,
                            file: null
                        };


                        var _fileSelecter = null;
                        var _submitSelecter = null;

                        var chil = angular.element(el[0].children);
                        for(var i=0;i<chil.length;i++) {
                            var child_check = angular.element(chil[i].attributes);
                            for(var j=0;j<child_check.length;j++) {
                              var _e = angular.element(child_check[j]);
                                if( (_e[0].name) == 's3-file-model')
                                 _fileSelecter = angular.element(chil[i]);
                                if((_e[0].name) == 's3-file-submit')
                                    _submitSelecter = angular.element(chil[i]);
                            }
                        }

                        var autoUpload = true;
                        var uploadType = attrs.s3AutoUpload;
                        if(uploadType != undefined) {
                            if(uploadType == 'false')
                              autoUpload = false;
                        }

                        _fileSelecter.bind('click', function (event) {
                            _fileSelecter[0].files[0] = null;
                           // startTask();
                        });

                        _fileSelecter.bind('change', function (event) {
                            if(autoUpload)
                                startTask();
                            _fileSelecter[0].files[0] = null;
                            scope.$apply;
                        });

                        if(!autoUpload) {
                              _submitSelecter.bind('click', function(event) {
                                if(!autoUpload) {
                                  if(_fileSelecter[0].files[0] == undefined) {
                                        scope.setErrorObj(6, "No files is Selected, Please Select a file before upload!")
                                  } else {
                                    startTask();
                                  }
                                }
                                _fileSelecter[0].files[0] = null;
                                scope.$apply;
                            });
                        }

                        function startTask() {

                            //set status vars
                              //status vars 
                                    scope.s3Status = {
                                        success : false,
                                        error : false,
                                        uploading : false,
                                        uploaded : false,
                                        progressCount : 0,
                                        path: null,   
                                        fileName : null,
                                        targetFileName : null,
                                        file:null,
                                        errorMsg: null,
                                        errorCode:null
                                    }
                                 //set child element status holders
                                 scope.progressSelecter.css({'display': 'none'});
                                 scope.completeSelecter.css({'display': 'none'});
                                 scope.errorSelecter.css({'display': 'none'});


                                    scope.$apply();
                             scope.checkValidation(); 
                                  

                            //enable progress
                                 scope.progressSelecter.css({'display': 'block'});



                            var fileName = _fileSelecter[0].files[0].name;
                            scope.s3Status.fileName = fileName;
                            scope.s3Status.file = _fileSelecter[0].files[0];
                            if(attrs.s3TargetName != undefined) {
                                if(attrs.s3TargetName.length != 0) {
                                   fileName = attrs.s3TargetName + fileName.slice(fileName.lastIndexOf('.'));

                                   if(attrs.s3TargetName == "[random]") {
                                    var _n = _fileSelecter[0].files[0].name;
                                    _n = _n.replace(/ /g,'')
                                    fileName = (new Date()).getTime() + '-' + scope.randomString(16) + "-" + _n;
                                   }
                                   scope.s3Status.targetFileName = fileName;
                               } 

                            }

                 

                            
                            //console.log(fileName);
                            

                            s3Info.key = attrs.s3Folder + "/" + fileName;
                            s3Info.file = _fileSelecter[0].files;
                            s3Info.file = _fileSelecter[0].files;



                            scope.getUploadOptions(attrs.s3AccessUri).then(function (response) {
                                

                                 scope.upload(scope, s3Info.uri, s3Info.key, s3Info.acl, s3Info.type, response.key, response.policy, response.signature, s3Info.file);


                              });
                        }
                }

            }    
  }]);
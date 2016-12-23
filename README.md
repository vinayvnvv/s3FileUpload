# s3-file-upload
## A Light Weight PowerFull ANGULAR Directive For Uploading a File to AMAZON S3 Server.

An AngularJS directive that allows you to simply upload files directly to AWS S3.

Features:
===========
* Ease of Use But PowerFull Angular Directive.
* Direct Upload to Amazon S3 Server.
* Open Source Free Light weight angular directive.
* Supports Call Back functions by detective the Status of file Upload ( pre-call , success-call , error-call ).
* Supports Dynamic changes for 'Target File Name' and 'Folder Name' with Angular 2-way Data Binding.
* Contains Status Block-elements inside directive which has auto Disable and enable for display.
* Contains Staus Object holds the information of the File uploading along with current upload status.

## Setup
1. Create AWS S3 bucket

2. Grant "put/delete" permissions to everyone
In AWS web interface, select S3 and select the destination bucket, then
expand the "Permissions" sections and click on the "Add more permissions" button. Select "Everyone" and "Upload/Delete" and save.

3. Add CORS configuration to your bucket

  In AWS web interface, select S3 and select the wanted bucket.
  Expand the "Permissions" section and click on the "Add CORS configuration" button. Paste the wanted CORS configuration, for example:
  ```XML
  <?xml version="1.0" encoding="UTF-8"?>
  <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
      <CORSRule>
          <AllowedOrigin>*</AllowedOrigin>
          <AllowedMethod>GET</AllowedMethod>
          <AllowedMethod>POST</AllowedMethod>
          <AllowedMethod>PUT</AllowedMethod>
          <AllowedHeader>*</AllowedHeader>
      </CORSRule>
  </CORSConfiguration>
    ```

  In addition, create the following crossdomain.xml file and upload it to the root of your bucket.

  ```XML
  <?xml version="1.0"?>
  <!DOCTYPE cross-domain-policy SYSTEM
  "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">
  <cross-domain-policy>
    <allow-access-from domain="*" secure="false" />
  </cross-domain-policy>
  ```

  Once the CORS permissions are updated, your bucket is ready for client side uploads.

4. Create a server side service that will return the needed details for uploading files to S3.
your service shall return a json in the following format:

  ```json
  {
   "policy": "XXXX",
   "signature": "YYY",
   "key": "ZZZ"
  }
  ```
XXX - A policy json that is required by AWS, base64 encoded.
YYY - HMAC and sha of your private key
ZZZ - Your public key
Here's a rails example, even if you're not a rails developer, read the code, it's very straight forward.

  For a php example, please refer to [this guide](https://github.com/asafdav/ng-s3upload/wiki/PHP-Creating-the-S3-Policy).
  ```ruby
      def s3_access_token
        render json: {
          policy:    s3_upload_policy,
          signature: s3_upload_signature,
          key:       GLOBAL[:aws_key]
        }
      end

      protected

        def s3_upload_policy
          @policy ||= create_s3_upload_policy
        end

        def create_s3_upload_policy
          Base64.encode64(
            {
              "expiration" => 1.hour.from_now.utc.xmlschema,
              "conditions" => [
                { "bucket" =>  GLOBAL[:aws_bucket] },
                [ "starts-with", "$key", "" ],
                { "acl" => "public-read" },
                [ "starts-with", "$Content-Type", "" ],
                [ "content-length-range", 0, 10 * 1024 * 1024 ]
              ]
            }.to_json).gsub(/\n/,'')
        end

        def s3_upload_signature
          Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), GLOBAL[:aws_secret], s3_upload_policy)).gsub("\n","")
        end
  ```

  The following code generates an upload policy that will be used by S3, in this example the maximum file size is limited to 10MB (10 * 1024 * 1024), update it to match your requirments. for a full list of S3's policy options, please refer to [AWS documentation](http://docs.aws.amazon.com/AmazonS3/latest/dev/HTTPPOSTExamples.html#HTTPPOSTExamplesTextAreaPolicy).


## How to get it ?

#### Manual Download
Download Zip from [here](https://github.com/vinayvnvv/s3FileUpload/releases) (v1.0)

```
npm and bower direct installation will available from v2.0
```


## Usage
1. Add `s3-file-upload.js` or `s3-file-upload.min.js` to your main file (index.html) (__min js file available in s3src folder__)
   ```html
     <script type="text/javascript" src="s3-file-upload.min.js"></script>
   ```  


2. Set `s3FileUpload` as a dependency in your module
  ```javascript
  var myapp = angular.module('myapp', ['s3FileUpload'])
  ```

3. Add s3-file-upload directive to the wanted element, example:

   * auto upload
  ```html
 <div 
     s3-file-upload="Bucket" 
     s3-folder="folder1/folder2" 
     s3-access-uri="/api/s3_access.json" 
     s3-pre-call="beforeUpload"
     s3-error-call="errorUpload"
     s3-succes-call="sucessUpload"
     s3-auto-upload="true" >
     <!-- Child elements  -->
       <input s3-file-model type="file"/> <!-- input File Holder -->
       <s3-progress>Progressing...</s3-progress> <!-- this block Visible when file is uploading -->
       <s3-success>SuccessFull!!</s3-success> <!-- this block Visible when file upload is success -->
       <s3-error>Error!</s3-error> <!-- this block Visible when error in file upload -->
  </div>
  ```
  
    * upload with submit button
  ```html
 <div 
     s3-file-upload="Bucket" 
     s3-folder="folder1/folder2" 
     s3-access-uri="/api/s3_access.json" 
     s3-pre-call="beforeUpload"
     s3-error-call="errorUpload"
     s3-succes-call="sucessUpload"
     s3-auto-upload="false" >
     <!-- Child elements  -->
       <input s3-file-model type="file"/> <!-- input File Holder -->
       <input s3-file-submit type="button" value="Upload"> <!-- Button Holds the click event for upload starts -->
       <s3-progress>Progressing...</s3-progress> <!-- this block Visible when file is uploading -->
       <s3-success>SuccessFull!!</s3-success> <!-- this block Visible when file upload is success -->
       <s3-error>Error!</s3-error> <!-- this block Visible when error in file upload -->
  </div>
  ```
  
  

## API and Attributes
| Name             | value        | description                                         | type     | default     
| :---------------:|:-----------: | :-----:                                             |  :---:   |  :--:       
| `s3-file-upload` | bucket name  | Root atrribute to function s3 file upload           | required |  -           
| `s3-folder`      | Folder path  | Folder path in s3 server where file being uploaded  | required |  -           
| `s3-access-uri`  | s3 acceess API url | api path to access s3 access details          | required |  - 
| `s3-target-name` | Target file Name | File to be upload in s3 server will changes with `target-file-name` attribute value| optional | -
| `s3-success-call`| Success Call name| Function to call after successfull upload (function will called with specified name defined in latest scope)| optional | -
| `s3-pre-call`| Pre Call name| Function to call before file upload starts (function will called with specified name defined in latest scope)| optional | -
| `s3-error-call`| Error Call name| Function to call after error occured on upload (function will called with specified name defined in latest scope)| optional | -
| `s3-auto-upload`  | true or false | upload type (`true`-without upload btn , `false`- with upload btn)        | optional |  - true 
| `s3-file-model`  | no value | must be used with child element of input[type=file],then this element will be the file holder(file model), this attribute has no value          | required |  - 
| `s3-file-submit`  | no value | must be used with child element of any type(a, button, div) ,then this element will be the click event to submit the file (this attribute works only if `s3-auto-upload="false"`)        | optional |  - 




## s3Status Object (contains information of s3 upload )
Members of s3Status object contains status and others inforamation of file upload provided by the directive and accessible inside the `s3-file-upload` scope.

```javascript
    s3Status = {
              success : boolean,
              error : boolean,
              uploading : boolean,
              uploaded : boolean,
              progressCount : int,
              path : string,
              fileName : string,
              targetFileName : string,
              file: Object,
              errorMsg: string,
              errorCode:string
         }


```
     
* Members:
  * `success` (true|false) - **_true_** if upload is success else **_false_**.
  * `error` (true|false) - **_true_** if any error in upload else **_false_**.
  * `uploading` (true|false) - **_true_** if the file is uploading else **_false_**.
  * `uploaded` (true|false) - **_true_** if the file is uploaded else **_false_**.
  * `progressCount` (0-100) - progress count from 0-100.
  * `path` (string) - final absolute path of s3 where file is to be upload (ex: `http://bucket.awshost.com/folder/filename.ext` )
  * `fileName` (string) - name of the file selected for upload
  * `targetFileName` (string) - target file name to override the original name of the file selected if specified in _s3-target-name_ attribute
  * `file` - javascript file Object contains file related information of the selected file
  * `errMsg` - error message if any error during the file upload
  * `errCode` - error code of the error to handle custom message in call back functions
      ###### Error Codes Table
      
      | Error Code | Description
      | ---       | --- 
      |  1        | bucket is undefined
      |  2        | folder is undefined
      |  3        | s3-access-uri is undefined
      |  4        | invalid information to s3 `or` XMLHttpRequest cannot load due to unsupported `allow-origin-access`
      |  5        | Error in Request to get S3 Access information! 




## Call Back Functions
   * call back functions will automatically called to the latest **Angular** scope of the controller.
   * call back functions should be called without any arguments . 
      
       - correct method : `s3-success-call="successHandler"` ( ✔ ) .
       - wrong method : ~~s3-success-call="successHandler()~~"   ( × )
   * even call back functions does not expecting any arguments from attribute value , s3Upload directive will automatically  passes usefull arguments and can use while it defining on latest scope
     #### Call back functions Parameters
      
  | call-back-function | arguments passed
  | ---                | --- 
  |  `s3-pre-call`     | _function_(s3Status)
  |  `s3-success-call` | _function_(xhr, s3Status)
  |  `s3-error-call`   | _function_(xhr, s3Status)
      
      
     - `xhr : XMLHttpRequest Object to S3 Server`
     - `s3Status : s3Status Object`
     
  #### Example 
  
    `app.html`
    
    ```html
    <body ng-app="myApp" ng-controller="myController">
         <div 
         s3-file-upload="Bucket" 
         s3-folder="folder1/folder2" 
         s3-access-uri="/api/s3_access.json" 
         s3-pre-call="s3PreCall"
         s3-error-call="s3SuccessCall"
         s3-succes-call="s3ErrorCall"
         s3-auto-upload="true"
         s3-target-name="mynewName">
         <!-- Child elements  -->
           <input s3-file-model type="file"/> <!-- input File Holder -->
           <s3-progress>Progressing...</s3-progress> <!-- this block Visible when file is uploading -->
           <s3-success>SuccessFull!!</s3-success> <!-- this block Visible when file upload is success -->
           <s3-error>Error!</s3-error> <!-- this block Visible when error in file upload -->
      </div>
  </body>
    
    ```
    
    `app.js`
    
    
    
    ```javascript
    var app = angular.module("myApp", ['s3FileUpload']; // inject s3-directive dependency  
    // define call-back function inside the controller where you use the directive
    app.controller("myController", function($scope) {
      
      // define Pre call (function should be defined with scope keyword and with the same name as mentioned in s3-pre-call attribute
      $scope.s3PreCall = function(s3Status) 
      
         console.log(s3Status); // log current s3Status object to browser console
      
      };
      
      // define Success call (function should be defined with scope keyword and with the same name as mentioned in s3-success-call attribute
      $scope.s3SuccessCall = function(xhr, s3Status) 

         console.log(s3Status); // log current s3Status object to browser console
      
      };
      
      // define Error call (function should be defined with scope keyword and with the same name as mentioned in s3-error-call attribute
      $scope.s3ErrorCall = function(xhr, s3Status) 
      
         console.log(s3Status); // log current s3Status object to browser console
      
      };
    
    });
    
    ```
    
    - Call back Functions are helpfull in many situations where we can enable the _loader_ icon at pre-call function and can disable at error-call `or` success-call functions 
    
## Target Name Options (`s3-target-name`)

  -  `s3-target-name` attribute holds the value which will override the original file name before uploading to s3 server.
  -  Target file name attribute should not contain file extention , because directive will appends file extension automatically.
  -  `s3-target-name` attributes also matches the special syntax for file renaming,  v1.0 supports only one syntax : `[random]`
   
   *  Ex : `s3-target-name="[random]"` - it changes name of file with a unique name by binding date+hashkey+original_ name
   
   
    sample :  `original_filename` **to** `4352837464-dhis2300ff4jekf34rhei-original_filename.png`
    

 ### Happy Coding..
 
 ---
 
  |Developer profile 
  | ---                
  |   ![alt text](https://avatars2.githubusercontent.com/u/24405794?v=3&s=100) 
  |Name : Vinay Shanubhag
  | email: tech.vinaybv@gmail.com
  |twitter: [Vinay](https://twitter.com/Vinayvnvv)
  |linkedIn: [Vinay](https://www.linkedin.com/in/vinay-shanubhag-7bb60b39)
  |Developing Area : Android , Java, AngularJS/2, RestAPI , MeanStack , PHP, JavaScript, MongoDb
  




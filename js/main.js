(function() {
    var publish = function(f) {
        return new Promise((resolve, reject) => {
            if (f.publish){
                resolve(callPublishWorkflow(f));
            } else {
                resolve(callIngestOnlyWorkflow(f));
            }
        });
    };

    var callIngestOnlyWorkflow = function(f) {
        console.log("ingest workflow");
        var statusLineArray = statusLine('Calling ingest only workflow...');
        var status = statusLineArray[0],
            result = statusLineArray[1];

        f.ingested = true;
        f.assetId = 123;
        status.appendChild(success(result));

        return f
    };

    var callPublishWorkflow = function(f) {
        console.log("publish workflow");
        var statusLineArray = statusLine('Calling ingest and publish workflow...');
        var status = statusLineArray[0],
            result = statusLineArray[1];

        f.published = true;
        f.assetId = 123;
        status.appendChild(success(result));

        return f;
    };

    var uploadThumbnail = function(f) {
        return new Promise((resolve, reject) => {
            console.log("thumbnailing");
            var statusLineArray = statusLine('Uploading thumbnails...');
            var status = statusLineArray[0],
                result = statusLineArray[1];

            f.thumbnailUploaded = true;
            status.appendChild(success(result));

            resolve(f);
        });
    };

    var sendMetadata = function(f) {
        return new Promise((resolve, reject) => {
            console.log("shipping metadata");
            var statusLineArray = statusLine('Sending metadata...');
            var status = statusLineArray[0],
                result = statusLineArray[1];

            var xhr = new XMLHttpRequest();
            var url = "http://debbiedeth.osb.ft.com:32780/"

            xhr.addEventListener('load', (event) => {
                status.appendChild(success(result));
                f.metdataUrl = url + JSON.parse(xhr.response).uuid;
                resolve(f);
            });

            xhr.addEventListener('error', (event) => {
                status.appendChild(failure(result, xhr.statusText));
                reject(f);
            })

            /*
              TODO: stop hardcoding development stuffs
             */
            xhr.open("POST", url);

            xhr.send(JSON.stringify(f));
        });
    };

    var uploadToS3 = function(f) {
        return new Promise((resolve, reject) => {
            var bucket = new AWS.S3({params: {Bucket: 'jspc-mio-s3-test'}});

            var statusLineArray = statusLine('Uploading to S3...');
            var status   = statusLineArray[0],
                s3Result = statusLineArray[1];

            var file = f.file;
            if (file) {
                var params = {Key: file.name, ContentType: file.type, Body: file};

                bucket.upload(params, function (err, data) {
                    if (err) {
                        status.appendChild(failure(s3Result, "S3 Upload Failed"));
                        reject(f);
                    } else {
                        status.appendChild(success(s3Result));
                        f.bucket = bucket.config.params.Bucket;
                        f.fileName = f.file.name;
                        resolve(f);
                    }
                });
            } else {
                status.appendChild( failure(s3Result, "No file specified") );
                reject(f);
            }
        });
    };

    var promiseSuccess = function(e){
        var statusLineArray = statusLine('Ingestion...');
        var status   = statusLineArray[0],
            result = statusLineArray[1];

        status.appendChild( success(result) );
    };

    var promiseFailure = function(e) {
        var m = e instanceof Error ? '' : 'Ingestion...'

        var statusLineArray = statusLine(m);
        var status = statusLineArray[0],
            result = statusLineArray[1];

        status.appendChild( failure(result, e.message) );
    };

    var statusLine = function(msg) {
        var statusDiv = document.getElementById('status'),
            status = document.createElement('span'),
            result = document.createElement('span'),
            statusString = document.createTextNode(msg);

        statusDiv.classList.add('status--show')

        status.classList.add('task');
        result.classList.add('task');

        status.appendChild(statusString);
        statusDiv.appendChild(status);

        return [status, result]
    };


    var failure = function(node, msg) {
        return setStatus('fail', node, msg);
    };

    var success = function(node) {
        return setStatus('success', node);
    };

    var setStatus = function(type, node, msg){
        if (typeof msg === 'undefined') { msg = ''; }

        console.log(msg);

        var f = document.createTextNode(" ✘ "),
            s = document.createTextNode(" ✔ "),
            m = document.createTextNode(msg),
            end = document.createElement('br');

        if (type == 'fail') {
            node.classList.add('task--failure');
            node.appendChild(f);
            node.appendChild(m);
        } else {
            node.classList.add('task--success');
            node.appendChild(s);
        }
        node.appendChild(end);
        return node;
    };

    var formData = function() {
        return new Promise((resolve, reject) => {
          var form = $("#uknowwhatsup");

          var links = {
              link_1: {
                  uri: $( "input[name=link1]", form ).val(),
                  text: $( "input[name=link1text]", form ).val(),
              },
              link_2: {
                  uri: $( "input[name=link2]", form ).val(),
                  text: $( "input[name=link2text]", form ).val(),
              },
              link_3: {
                  uri: $( "input[name=link3]", form ).val(),
                  text: $( "input[name=link3text]", form ).val(),
              },
              link_4: {
                  uri: $( "input[name=link4]", form ).val(),
                  text: $( "input[name=link4text]", form ).val(),
              }
          };

          var f = {
              brand: $( "input[name=brand]", form ).val(),
              detail: $( "textarea[name=detail]", form ).val(),
              file: document.getElementById('asset').files[0],
              headline: $( "input[name=headline]", form ).val(),
              lead: $( "input[name=lead]", form ).val(),
              links: links,
              producer: $( "input[name=producer]", form ).val(),
              publish: document.getElementById('publish').checked,
              section: $( "input[name=section]", form ).val(),
              tags: $( "textarea[name=tags]", form ).val().split(" "),
              thumbnail: document.getElementById('thumbnail').files[0],
          };

            resolve(f);
        });

    };

    window.addEventListener('load', function() {
        AWS.config.region = 'eu-west-1';
        AWS.config.update({accessKeyId: '', secretAccessKey: ''});

        $( "#uknowwhatsup" ).submit(function( event ) {
            event.preventDefault();

            console.log('Got submit');

            formData()
                .then(uploadToS3)
                .then(publish)
                .then(uploadThumbnail)
                .then(sendMetadata)
                .then(function(f) {
                    console.log(f);
                    console.log(JSON.stringify(f));
                })
                .then(promiseSuccess)
                .catch(promiseFailure);

        });
    });

})();

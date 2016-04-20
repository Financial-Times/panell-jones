var callIngestOnlyWorkflow = function() {
    console.log("ingest workflow");
}

var callPublishWorkflow = function() {
    console.log("publish workflow");
}

var uploadThumbnail = function() {
    console.log("thumbnailing");
}

var uploadToS3 = function() {
    var bucket = new AWS.S3({params: {Bucket: 'jspc-mio-s3-test'}});

    var status = document.getElementById('status'),
        s3Status = document.createElement('span'),
        s3Result = document.createElement('span'),
        s3StatusString = document.createTextNode('Uploading to S3...'),
        fileChooser = document.getElementById('asset');

    s3Status.classList.add('task');
    s3Result.classList.add('task');

    s3Status.appendChild(s3StatusString);
    status.appendChild(s3Status);

    var file = fileChooser.files[0];
    if (file) {
        var params = {Key: file.name, ContentType: file.type, Body: file};
        bucket.upload(params, function (err, data) {
            status.appendChild(err ? failure(s3Result, "S3 Upload Failed") : success(s3Result) );
        });
    } else {
        status.appendChild( failure(s3Result, "No file specified") );
    }
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

    var f = document.createTextNode("✘ "),
        s = document.createTextNode("✔ "),
        m = document.createTextNode(msg),
        end = document.createElement('br');

    if (type == 'fail') {
        node.classList.add('failure');
        node.appendChild(f);
        node.appendChild(m);
    } else {
        node.classList.add('success');
        node.appendChild(s);
    }
    node.appendChild(end);
    return node;
};

var main = function() {
    AWS.config.region = 'eu-west-1';
    AWS.config.update({accessKeyId: '', secretAccessKey: ''});

    $( "#uknowwhatsup" ).submit(function( event ) {
        event.preventDefault();
        var links = {
            link_1: {
                uri: $( "#uknowwhatsup input[name=link1]" ).val(),
                text: $( "#uknowwhatsup input[name=link1text]" ).val(),
            },
            link_2: {
                uri: $( "#uknowwhatsup input[name=link2]" ).val(),
                text: $( "#uknowwhatsup input[name=link2text]" ).val(),
            },
            link_3: {
                uri: $( "#uknowwhatsup input[name=link3]" ).val(),
                text: $( "#uknowwhatsup input[name=link3text]" ).val(),
            },
            link_4: {
                uri: $( "#uknowwhatsup input[name=link4]" ).val(),
                text: $( "#uknowwhatsup input[name=link4text]" ).val(),
            }
        };

        var f = {
            brand: $( "#uknowwhatsup input[name=brand]" ).val(),
            detail: $( "#uknowwhatsup input[name=detail]" ).val(),
            headline: $( "#uknowwhatsup input[name=headline]" ).val(),
            lead: $( "#uknowwhatsup input[name=lead]" ).val(),
            links: links,
            producer: $( "#uknowwhatsup input[name=producer]" ).val(),
            section: $( "#uknowwhatsup input[name=section]" ).val(),
            tags: $( "#uknowwhatsup textarea[name=tags]" ).val().split(" "),
        };

        console.log(f);
        console.log(JSON.stringify(f));

        uploadToS3();
        if ($('#publish').is(':checked')){
            callPublishWorkflow(f);
        } else {
            callIngestOnlyWorkflow(f);
        }

        uploadThumbnail();
    });
};

main();

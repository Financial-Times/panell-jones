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
    /*
       http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-examples.html#Uploading_a_local_file_using_the_File_API
    */
    console.log("upload peww peww");
}

var main = function() {
    $( "#uknowwhatsup" ).submit(function( event ) {
        event.preventDefault();
        var tags = $( "#uknowwhatsup :input[name=tags]" ).val();
        var f = {
            section: $( "#uknowwhatsup input[name=section]" ).val(),
            subsection: $( "#uknowwhatsup input[name=subsection]" ).val(),
            tags: String(tags).split(" ")
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

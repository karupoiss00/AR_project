<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    mkdir('/saves/'.$dir, 0777, true);

    copy('./index.html', 'saves/'.$dir.'/index.html');
    copy('./index.js', 'saves/'.$dir.'/index.js');
    $file = fopen('saves/'.$dir.'/'.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>
<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    mkdir('saves/'.$dir);
?>
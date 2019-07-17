<html>
	<head>
		<title>AR Test</title>
		<script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
		<script src="https://cdn.rawgit.com/jeromeetienne/AR.js/1.6.0/aframe/build/aframe-ar.js"></script>
	</head>
	<body style='margin : 0px; overflow: hidden;'
		<a-scene embedded arjs='sourceType: webcam;'>
			<a-assets>
				<a-asset-item id="chair" src="/models/chair/model.dae"></a-asset-item>
			</a-assets>
			<a-marker type='pattern' url='patterns/chair.patt'>
				<a-entity gltf-model="##chair"></a-entity>
			</a-marker>
			<a-entity camera></a-entity>
		</a-scene>
	</body>
</html>

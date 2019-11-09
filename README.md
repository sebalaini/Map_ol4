# Map_ol4

This project is just a minor project to show what I have worked on since I join as a junior web developer at Buchanan Computing.

The real project is **[Traffweb](http://www.traffwebdemo.co.uk/)** and as a lead web developer I was in charge of the new major upgrade.

For the interface I switch from old technologies like Jquery Mobile, Jquery UI and ThemeRoller to a modern one; Bootstrap.

Here the comparison between the old and new interface for Desktop and Mobile; previously there was 2 website for every customer (mobile an desktop), with the new design I developed a responsive web app.

Here the old version
![Old Image](https://user-images.githubusercontent.com/17096352/38583856-4a4104b0-3d0c-11e8-9930-bad8fa027843.png)

and here the new version

![New Image](https://user-images.githubusercontent.com/17096352/38583885-6683c32e-3d0c-11e8-8504-d76f4205522f.png)

Speaking about the mapping framework I migrate from OpenLayers2 to OpenLayers4, The core between the 2 versions is completely different and require me to rewritten completely the JS code, I've also split the code into modules to be reusables and reduce the duplicate code; I've also implemented a web environment with Webpack and be able to work from your workstation instead of copying continuosly all the files into the development server and test the code there.

In the previous version of Traffweb every customer had his own files on the website including all the dependency like Jquery, Jquery Mobile, OpenLayer2 and the project files like the Javascript and CSS file, each Javascript file was slightly different depending if the customer wanted some customizations.

![New Image](https://user-images.githubusercontent.com/17096352/68525428-3b03ac80-02c9-11ea-9964-5bb9ed858aaa.png)

With the new version I developed a CDN, both for the assets and the backgroud mapping, is located on 2 servers behind a load balancer to improve performances.

The Js code includes all the customization for all the clients and the CSS code is responsible for all the layout an the mobile colors while the customer theme from tablet onwards is sitting on each clients website.

![New Image](https://user-images.githubusercontent.com/17096352/68525433-48209b80-02c9-11ea-94bc-84fc7395bf63.png)

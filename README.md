# Map_ol4

This project is just a minor project to show what I have worked on since last October as a junior web developer at Buchanan Computing.


The real project name is **Traffweb** and as a sole web developer in the company I was in charge of the new major upgrade.

For the interface I switch from old technologies like Jquery Mobile, Jquery UI and ThemeRoller to modern ones like Bootstrap.

Here the comparison between the old and new interface for Desktop and Mobile; previously there was 2 website for every customer (mobile an desktop), with the new design I developed a progressive web app.

Here the old version
![Old Image](https://user-images.githubusercontent.com/17096352/38583856-4a4104b0-3d0c-11e8-9930-bad8fa027843.png)

and here the new version

![New Image](https://user-images.githubusercontent.com/17096352/38583885-6683c32e-3d0c-11e8-8504-d76f4205522f.png)

Speaking about the mapping framework I rewritten almost the whole JS code and switch from OpenLayers2 to OpenLayers4; The migration to OpenLayers4 required me a lot of time as the core between the 2 versions is completely different, and the approach to solve the same problem is different.

In the previous version every customer had his own files on the website (all the dependency like Jquery, Jquery Mobile, OpenLayer2 and the project files like the Javascript and CSS file), with the new version we have developed a CDN and all the code that can be shared is hosted there, in this way I reduced the time spent on upgrading and fixing bug for every client.

Instead of change the same file for 30/40 customers you just need to update one file and all the customers are updated.

For more information about the project http://www.traffwebdemo.co.uk/


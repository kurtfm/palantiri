# run this
#vagrant plugin install vagrant-vbguest (uninstalled ... adds extra time)
#vagrant plugin install vagrant-timezone

#-*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  #config.vm.box = "centos/7"
  #config.vm.box = "ubuntu/trusty64"
  config.vm.box = "box-cutter/ubuntu1404-docker"
  #config.vm.hostname = "palanteerdev-#{rand(11111..99999)}.vagrant.vm"
  config.vm.hostname = "kurt-70087.vagrant.vm"
  config.vm.network "public_network",
    bridge: ["en5: Display Ethernet","en0: Wi-Fi (AirPort)"]

  config.vm.provision "docker" do |d|
    #d.run "datadog/docker-dd-agent",
    d.run "datadog/docker-dd-agent:alpine",
    name: "dd-agent",
    args: "-dti -v /var/run/docker.sock:/var/run/docker.sock -v /proc/:/host/proc/:ro -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro -e API_KEY=e2fece0d6d8693b5135a7779dc3c80fc"
    #-v /etc/localtime:/etc/localtime:ro
    d.run "mhart/alpine-node:5",
    name: "palanteer",
    args: "-dti -v /vagrant:/usr/local/palanteer --link dd-agent:dd-agent",
    cmd: "/bin/ash"
   end
#config.vm.provision :shell, path: "vagrant-bootstrap.sh"


  config.vm.provider :virtualbox do |v|
    v.customize ["guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 10000]
  end

  if Vagrant.has_plugin?("vagrant-timezone")
    #config.timezone.value = "PST"
    config.timezone.value = :host
  end

end

# Installation on Ubuntu VPS


```sh
scp install_ubuntu.sh user@your-vps-ip:/tmp/
ssh -t user@your-vps-ip "cd /tmp && chmod +x install_ubuntu.sh && ./install_ubuntu.sh"
```

Tested on Ubuntu 24.04.4 LTS.
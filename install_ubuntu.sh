#!/bin/bash

read -p "domain (eg: \"myapp.duckdns.org\"): " DNS && \
read -p "webhook secret (eg: \"SuperP@ssw0rd!\"): " WEBHOOK_SECRET && \
read -p "repo HTTPS URL (eg: \"https://github.com/ComicScrip/the-good-corner-nov25.git\"): " REPO_URL && \

sudo apt-get update && \

# Docker install : https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
# Add Docker's official GPG key:
sudo apt install -y ca-certificates curl git-all && \
sudo install -m 0755 -d /etc/apt/keyrings && \
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && \
sudo chmod a+r /etc/apt/keyrings/docker.asc && \
# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt-get update && \

# Install Docker, Caddy, Go (snap), Webhook, Fail2ban
sudo apt-get install -y webhook debian-keyring debian-archive-keyring apt-transport-https fail2ban caddy docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin snapd && \
sudo snap install go --classic && \
export PATH=/snap/bin:$PATH && \

sudo service apache2 stop
sudo apt-get purge apache2 -y
sudo apt-get autoremove -y


# Confirgure docker
sudo groupadd -f docker && \
sudo usermod -aG docker $USER && \

# Configure fail2ban
sudo touch /etc/fail2ban/jail.local && \
sudo cat <<EOF > /etc/fail2ban/jail.local
[ssh-ddos]
enabled = true
EOF
sudo /etc/init.d/fail2ban restart && \

# Build Caddy with rate limiting module
curl -L "https://github.com/caddyserver/xcaddy/releases/download/v0.4.5/xcaddy_0.4.5_linux_amd64.tar.gz" -o /tmp/xcaddy.tar.gz && \
sudo tar -xzf /tmp/xcaddy.tar.gz -C /tmp && \
sudo chmod +x /tmp/xcaddy && \
sudo /tmp/xcaddy build --with github.com/mholt/caddy-ratelimit && \
sudo cp /usr/bin/caddy /usr/bin/caddy.bak.$(date +%s) && \
sudo cp /tmp/caddy /usr/bin/caddy && \
sudo chown root:root /usr/bin/caddy && \
sudo chmod 0755 /usr/bin/caddy && \

# Configure caddy (rate limit 20 r/s, burst 50) and restart
sudo cat <<EOF > /etc/caddy/Caddyfile
{
  order rate_limit before respond
}

$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:82
}

staging.$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:81
}

ops.$DNS {
  rate_limit {
    zone shared_rate_limit {
      key {remote_host}
      events 20
      window 1s
      burst 50
    }
  }
  reverse_proxy localhost:9000
}
EOF
sudo systemctl start caddy && \

# Configure webhook and restart

sudo cat <<EOF > /etc/webhook.conf
[
  {
    "id": "redeploy-tgc-staging",
    "execute-command": "$HOME/apps/$DNS/staging/start.sh",
    "pass-arguments-to-command": [{"source": "string", "name": "staging"}],
    "command-working-directory": "$HOME/apps/$DNS/staging",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "value",
            "value": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Webhook-Secret"
            }
          }
        }
      ]
    }
  },
  {
    "id": "redeploy-tgc-prod",
    "execute-command": "$HOME/apps/$DNS/prod/start.sh",
    "pass-arguments-to-command": [{"source": "string", "name": "prod"}],
    "command-working-directory": "$HOME/apps/$DNS/prod",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "value",
            "value": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Webhook-Secret"
            }
          }
        }
      ]
    }
  }
]
EOF

sudo chmod o+w /lib/systemd/system/webhook.service && \
sudo cat <<EOF > /lib/systemd/system/webhook.service
[Service]
ExecStart=/usr/bin/webhook -verbose -nopanic -hooks /etc/webhook.conf
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload && \
sudo systemctl enable webhook && \
sudo systemctl restart webhook && \

# downloading repos

mkdir -p "$HOME/apps/$DNS/prod" && cd "$HOME/apps/$DNS/prod" && \
git clone $REPO_URL .

mkdir -p "$HOME/apps/$DNS/staging" && cd "$HOME/apps/$DNS/staging" && \
git clone $REPO_URL . && git checkout dev && \

echo "✨ DONE ! ✨ Next step : setup env variables and do the first deployment on staging." && \

# To enable running docker without sudo
newgrp docker

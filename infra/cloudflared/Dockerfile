FROM alpine:3.19

RUN apk add --no-cache gettext ca-certificates

# install cloudflared binary
RUN wget -O /usr/local/bin/cloudflared \
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
 && chmod +x /usr/local/bin/cloudflared

WORKDIR /infra/cloudflared

ENTRYPOINT ["/bin/sh"]
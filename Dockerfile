FROM rabbitmq:3.7-management

RUN set -x \
  && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
  && wget -O /plugins/rabbitmq_delayed_message_exchange-3.8.0.ez https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.8.0/rabbitmq_delayed_message_exchange-3.8.0.ez \
  && apt-get purge -y --auto-remove ca-certificates wget

RUN rabbitmq-plugins list

RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange

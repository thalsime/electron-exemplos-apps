#!/usr/bin/env bash
# Gera a autoridade certificadora local, o certificado do servidor e o do cliente.
# Baseado em https://github.com/thojansen/client-certificates/blob/master/ssl/setup.sh
#
# Rode de qualquer lugar: os arquivos saem sempre nesta pasta, e não no diretório
# de onde o script foi chamado.
#
# Nada do que é gerado aqui entra no repositório - o .gitignore do exemplo
# bloqueia, porque chave privada não se versiona.

set -eu
cd "$(cd -P "$(dirname "$0")" && pwd)"

echo "== autoridade certificadora (rootCA) =="
openssl genrsa -out rootCA.key 2048
openssl req -x509 -new -nodes -key rootCA.key -days 1024 -out rootCA.crt \
    -subj "/C=BR/ST=RN/L=Natal/O=Senac/OU=Exemplos/CN=rootCA"

echo "== certificado do servidor (CN=localhost + SAN) =="
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
    -subj "/C=BR/ST=RN/L=Natal/O=Senac/OU=Exemplos/CN=localhost"

# O subjectAltName não é decoração: o Chromium (e portanto o Electron) IGNORA o
# Common Name desde 2017 e valida o nome do host apenas pelo SAN. Sem esta
# extensão o navegador recusa com ERR_CERT_COMMON_NAME_INVALID, mesmo com a
# autoridade confiável no sistema.
#
# O `curl` ainda aceita CN, então um certificado sem SAN passa no teste por curl
# e falha no aplicativo - o que torna esse defeito especialmente enganoso.
openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial \
    -out server.crt -days 500 \
    -extfile <(cat <<'EXT'
subjectAltName = DNS:localhost, IP:127.0.0.1
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
EXT
)

echo "== certificado do cliente =="
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
    -subj "/C=BR/ST=RN/L=Natal/O=Senac/OU=Exemplos/CN=client"
openssl x509 -req -in client.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial \
    -out client.crt -days 500 \
    -extfile <(cat <<'EXT'
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
EXT
)

echo "== empacotando o cliente em client.p12 para importar no sistema =="
# Duas opções do comando existem por motivos diferentes, e as duas só falham na
# ponta - o arquivo é gerado com sucesso nos dois casos:
#
# -legacy: o padrão do OpenSSL 3 usa AES-256, que o Chaveiro do macOS e a loja
#   de certificados do Windows recusam importar.
#
# -passout pass:$SENHA_P12, e NÃO senha vazia: em PKCS#12 "senha vazia" e "sem
#   senha" produzem MACs diferentes, e o Security.framework do macOS recusa o
#   arquivo de senha vazia com "MAC verification failed (wrong password?)",
#   embora o próprio openssl o abra sem reclamar.
SENHA_P12=exemplo
openssl pkcs12 -export -legacy -inkey client.key -in client.crt \
    -name client -out client.p12 -passout "pass:$SENHA_P12"

echo
echo "Pronto. Arquivos gerados em $(pwd)"
echo
echo "Próximos passos:"
echo "  1. Importe a identidade do cliente e confie na autoridade local."
echo "     No macOS:"
echo "       security import client.p12 -k ~/Library/Keychains/login.keychain-db \\"
echo "           -t agg -f pkcs12 -P $SENHA_P12 -A"
echo "       security add-trusted-cert -r trustRoot \\"
echo "           -k ~/Library/Keychains/login.keychain-db rootCA.crt"
echo "     A senha do client.p12 é: $SENHA_P12"
echo "  2. Suba o servidor:   npm run servidor"
echo "  3. Rode o aplicativo: npm run dev"
echo
echo "Para desfazer depois:"
echo "  security delete-certificate -c rootCA -t ~/Library/Keychains/login.keychain-db"
echo "  security delete-identity -c client ~/Library/Keychains/login.keychain-db"

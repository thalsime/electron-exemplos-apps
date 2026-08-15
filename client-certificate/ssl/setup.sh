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

echo "== certificado do servidor (CN=localhost) =="
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
    -subj "/C=BR/ST=RN/L=Natal/O=Senac/OU=Exemplos/CN=localhost"
openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial \
    -out server.crt -days 500

echo "== certificado do cliente =="
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
    -subj "/C=BR/ST=RN/L=Natal/O=Senac/OU=Exemplos/CN=client"
openssl x509 -req -in client.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial \
    -out client.crt -days 500

echo "== empacotando o cliente em client.p12 para importar no sistema =="
# Senha vazia (-passout pass:) para o script rodar sem interação.
#
# O -legacy é necessário no OpenSSL 3: o padrão novo usa AES-256, que o Chaveiro
# do macOS e a loja de certificados do Windows recusam importar. Sem ele o
# arquivo é gerado com sucesso e só falha na importação, o que engana.
openssl pkcs12 -export -legacy -inkey client.key -in client.crt \
    -name client -out client.p12 -passout pass:

echo
echo "Pronto. Arquivos gerados em $(pwd)"
echo "Próximos passos:"
echo "  1. Importe rootCA.crt e client.p12 no sistema (a senha do p12 é vazia)"
echo "  2. Suba o servidor:  npm run servidor"
echo "  3. Rode o aplicativo: npm run dev"

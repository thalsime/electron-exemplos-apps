# Certificado de cliente

Demonstra autenticação por **certificado de cliente**: em vez de usuário e senha, quem prova
a identidade é um certificado instalado no sistema operacional.

O exemplo é autocontido. Ele traz o próprio servidor HTTPS, que exige o certificado e
responde `approved` ou `denied`, e um script que gera toda a cadeia de certificados
localmente.

## O que este exemplo demonstra

- O evento `select-client-certificate` do Electron, que entrega ao aplicativo a lista de
  certificados disponíveis e deixa a escolha por conta dele
- Um servidor HTTPS com `requestCert`, escrito em TypeScript e executado direto pelo Node 24
- A diferença de comportamento entre Electron e navegador: o navegador **pergunta** ao
  usuário qual certificado usar; o Electron escolhe o primeiro sozinho, a menos que o
  aplicativo trate o evento

## Pré-requisitos

- Node.js 24 ou superior
- OpenSSL disponível na linha de comando
- Permissão para importar certificados no sistema

## Como executar

São três etapas: gerar os certificados, confiar neles, subir o servidor.

```bash
# 1. Gerar a autoridade local e os certificados (uma vez)
./ssl/setup.sh

# 2. Importar no sistema. No macOS:
security import ssl/client.p12 -k ~/Library/Keychains/login.keychain-db \
    -t agg -f pkcs12 -P exemplo -A
security add-trusted-cert -r trustRoot \
    -k ~/Library/Keychains/login.keychain-db ssl/rootCA.crt

# 3. Subir o servidor, em um terminal separado
npm run servidor

# 4. Rodar o aplicativo
npm run dev
```

Com tudo no lugar, a janela mostra `approved`. Sem o certificado importado, mostra `denied`.
Sem o servidor no ar, aparece a página local de instruções.

## Como desfazer

O passo 2 instala uma **autoridade certificadora** na sua máquina. Ela é de exemplo, e a chave
privada dela fica em `ssl/rootCA.key`, dentro deste repositório - por isso convém remover
quando terminar:

```bash
security delete-certificate -c rootCA -t ~/Library/Keychains/login.keychain-db
security delete-identity -c client ~/Library/Keychains/login.keychain-db
```

## Pontos de atenção

**Certificado sem `subjectAltName` é recusado.** O Chromium, e portanto o Electron, ignora o
Common Name para verificação de nome de host desde 2017 e valida só pelo `subjectAltName`. O
script já gera a extensão; sem ela, o sintoma seria `ERR_CERT_COMMON_NAME_INVALID` mesmo com
a autoridade confiável. E note a armadilha: o `curl` ainda aceita Common Name, então um
certificado defeituoso passaria no teste por linha de comando e falharia no aplicativo.

**O `.p12` precisa de senha, mesmo que trivial.** Em PKCS#12, "senha vazia" e "sem senha"
produzem MACs diferentes, e o Chaveiro do macOS recusa o arquivo de senha vazia com
`MAC verification failed` - enquanto o próprio `openssl` o abre sem reclamar. A senha usada
pelo script é `exemplo`, impressa ao final da execução.

**Nada em `ssl/` entra no repositório.** O `.gitignore` do exemplo bloqueia chaves e
certificados: chave privada não se versiona, e as geradas aqui são descartáveis.

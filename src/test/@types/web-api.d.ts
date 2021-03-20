type TestWebApi = {
  username      : string,
  password      : string,
  protocol      : string,
  host          : string,
  port          : number,
  timeout?      : number,
  request       : Array<TestWebApiRequest>
}

type TestWebApiRequest = {
  method        : string,
  path          : string,
  query?        : TestWebApiQuery,
  body?         : TestWebApiBody,
  file?         : TestWebApiFile,
  response      : TestWebApiResponce,
  effect?       : any
}

type TestWebApiQuery = {
  [key: string] : string
}

type TestWebApiBody = {
  [key: string] : string
}

type TestWebApiFile = {
  name          : string,
  path          : string,
  description?  : string
}

type TestWebApiResponce = {
  msg           : string,
  [key: string] : string
}

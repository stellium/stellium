import * as path from 'path';


export interface AppEnvironment {
    production: boolean,
    render_from_json: boolean,
    multi_cluster: boolean,
    base_url: string,
    api_url: string,
    stellium_domain: string,
    modules: string[],
    ssl_path: string,
    use_ssl: boolean,
    key_file: string,
    crt_file: string,
    port: number,
    database_auth: string,
    database_name: string,
    secret: string,
    mailer: {
        email: string,
        secret: string
    },
    mandrill: {
        host: string,
        port: number,
        user_name: string,
        api_key: string,
    }
}


export const ENV: AppEnvironment = require(path.resolve(StelliumRootPath, 'env'));

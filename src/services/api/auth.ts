import { message } from 'antd';

// 定义返回结果类型
export interface ResultType<T> {
  code: number;
  data: T;
  msg: string;
  success: boolean;
}

// 登录参数类型
export interface LoginParams {
  account: string;
  password?: string;
  dynamicId?: string;
  dynamicCode?: string;
}

// 验证码请求参数类型
export interface DynamicCodeParams {
  account: string;
  platName: string;
  dynamicId: string;
}

// 验证码返回结果类型
export interface DynamicCodeResult {
  dynamicId: string;
}

// 登录返回结果类型
export interface TokenResultModel {
  accessToken: string;
  expiresIn: number;
  author: string;
  license: string;
  tokenType: string;
  target: any; // 用户信息
  privateKey: string;
}

// 重置密码参数类型
export interface ResetPwdParams {
  account: string;
  privateKey?: string;
  dynamicId?: string;
  dynamicCode?: string;
  password: string;
}

// 注册参数类型
export interface RegisterParams {
  account: string;
  password: string;
  dynamicId: string;
  dynamicCode: string;
  name: string;
  remark: string;
}

// 通知参数类型
export interface NoticeParams {
  shareId: string;
  authId: string;
  data: string;
  type: string;
  platName: string;
}

// HTTP响应类型
interface HttpResponse {
  statusCode: number;
  statusText: string;
  content: string;
}

/**
 * 创建错误响应
 */
function badRequest(msg: string, code: number = 500): ResultType<any> {
  return {
    code: code,
    data: null,
    msg: msg || '请求异常',
    success: false
  };
}

/**
 * 授权服务类
 */
class AuthService {
  private baseUrl: string = '/orginone/kernel'; // 修改为使用代理
  private accessToken: string = '';

  /**
   * 获取存储在sessionStorage中的token
   */
  getAccessToken(): string {
    return sessionStorage.getItem('accessToken') || '';
  }

  /**
   * 设置token到sessionStorage
   */
  setAccessToken(token: string): void {
    sessionStorage.setItem('accessToken', token);
    this.accessToken = token;
  }

  /**
   * 清除token
   */
  clearAccessToken(): void {
    sessionStorage.removeItem('accessToken');
    this.accessToken = '';
  }

  /**
   * 基础请求方法
   */
  async request<T>(module: string, action: string, params: any): Promise<ResultType<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/rest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify({
          module,
          action,
          params
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        code: 500,
        data: null as any,
        msg: '服务请求异常',
        success: false
      };
    }
  }

  /**
   * 仓库货架库位的请求服务端方法
   */
  async warehouseRequest<T>(module: string, action: string, params: any): Promise<ResultType<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/dataproxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify({
          module: "Collection",
          action: "Load",
          belongId: "509305312306663424",
          targetId: "548820032067616768",
          params: {
            requireTotalCount: true,
            options: {
              match: {
                speciesId: "710060066056966145"
              }
            },
            collName: "standard-species-item"
          },
          relations: [
            "509305312306663424",
            "548820032067616768"
          ]
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        code: 500,
        data: null as any,
        msg: '服务请求异常',
        success: false
      };
    }
  }
  /**
     * 用卡片编码搜索方法
     * @param cardCode 卡片编码
     */
  async searchCardCode<T>(cardCode: string): Promise<ResultType<T>> {
    try {
      console.log('发送卡片编码搜索请求:', cardCode);

      const requestBody = {
        module: "Collection",
        action: "Load",
        belongId: "509305312306663424",
        targetId: "548820032067616768",
        params: {
          userData: [],
          options: {
            match: {
              isDeleted: false,
              T695329228530655233: cardCode // 使用传入的卡片编码
            },
            project: {
              archives: 0
            }
          },
          belongId: "509305312306663424",
          collName: "_system-things"
        },
        relations: [
          "509305312306663424",
          "548820032067616768"
        ]
      };

      console.log('请求体:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/rest/dataproxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('卡片编码搜索API返回:', result);

      // 检查返回的数据结构
      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          console.log(`API返回数据条数: ${result.data.length}`);
          if (result.data.length > 0) {
            console.log('第一条数据字段:', Object.keys(result.data[0]));
          }
        } else {
          console.log('API返回的数据不是数组:', typeof result.data);
        }
      }

      return result;
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        code: 500,
        data: null as any,
        msg: '服务请求异常',
        success: false
      };
    }
  }
  /**
     * 所有物品数据请求方法
     */
  async getAllItems<T>(): Promise<ResultType<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/dataproxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify({
          module: "Collection",
          action: "Load",
          belongId: "509305312306663424",
          targetId: "548820032067616768",
          params: {
            sort: [
              {
                selector: "id",
                desc: false
              }
            ],
            group: null,
            requireTotalCount: true,
            searchOperation: "contains",
            searchValue: null,
            userData: [],
            filter: [
              [
                [
                  "id",
                  "<>",
                  null
                ],
                "and",
                [
                  "id",
                  "<>",
                  ""
                ]
              ],
              "and",
              [
                [
                  "T695329228530655233",
                  "<>",
                  null
                ],
                "and",
                [
                  "T695329228530655233",
                  "<>",
                  ""
                ]
              ],
              "and",
              [
                "T652171404141268993",
                "=",
                "S652171467810803713"
              ]
            ],
            options: {
              match: {
                isDeleted: false
              },
              project: {
                archives: 0
              }
            },
            belongId: "509305312306663424",
            collName: "_system-things"
          },
          relations: [
            "509305312306663424",
            "548820032067616768"
          ]
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        code: 500,
        data: null as any,
        msg: '服务请求异常',
        success: false
      };
    }
  }
  /**
   * 授权请求方法
   */
  async auth<T>(action: string, params: any): Promise<ResultType<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify({
          module: 'auth',
          action,
          params
        })
      });

      const result = await response.json();

      // 如果返回了token信息，自动保存
      if (
        result.success &&
        result.data &&
        typeof result.data === 'object' &&
        'accessToken' in result.data
      ) {
        this.setAccessToken(result.data.accessToken);
        await this.tokenAuth();
      }

      return result;
    } catch (error) {
      console.error('授权请求失败:', error);
      return {
        code: 500,
        data: null as any,
        msg: '授权请求异常',
        success: false
      };
    }
  }

  /**
   * 根据token获取用户信息
   */
  async tokenAuth(): Promise<boolean> {
    const token = this.getAccessToken();
    if (token && token.length > 0) {
      try {
        const response = await fetch(`${this.baseUrl}/rest/tokenauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(token)
        });

        const result = await response.json();
        if (result.success) {
          return true;
        }
      } catch (error) {
        console.error('Token验证失败:', error);
      }
    }
    return false;
  }

  /**
   * 获取动态密码
   */
  async getDynamicCode(params: DynamicCodeParams): Promise<ResultType<DynamicCodeResult>> {
    return await this.auth<DynamicCodeResult>('DynamicPwd', params);
  }

  /**
   * 用户登录
   */
  async login(params: LoginParams): Promise<ResultType<TokenResultModel>> {
    const result = await this.auth<TokenResultModel>('Login', params);
    if (!result.success) {
      message.error(result.msg || '登录失败');
    }
    return result;
  }

  /**
   * 注册用户
   */
  async register(params: RegisterParams): Promise<ResultType<TokenResultModel>> {
    const result = await this.auth<TokenResultModel>('Register', params);
    if (!result.success) {
      message.error(result.msg || '注册失败');
    }
    return result;
  }

  /**
   * 重置密码
   */
  async resetPassword(params: ResetPwdParams): Promise<ResultType<TokenResultModel>> {
    const result = await this.auth<TokenResultModel>('ResetPwd', params);
    if (!result.success) {
      message.error(result.msg || '重置密码失败');
    }
    return result;
  }

  /**
   * 发送通知
   */
  async sendNotice(params: NoticeParams): Promise<ResultType<boolean>> {
    return await this.auth<boolean>('SendNotice', params);
  }

  /**
   * 退出登录
   */
  logout(): void {
    this.clearAccessToken();
  }
}

export default new AuthService(); 
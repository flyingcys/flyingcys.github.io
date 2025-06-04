| 序号 | 错误日志 | 问题原因分析 |
| ---- | ------- | ----------- |
| 1 | lfs open uuidxxxxxxxxxxxxxxxx -2 err | 未读取到授权码，未修改config.h中的UUID和AUTH_KEY，相关信息可查看TuyaOpen授权码获取指南 |
| 2 | ble packet len err: | 使用了错误的授权码，请使用串口写入TuyaOpen授权码或修改config.h中的UUID和AUTH_KEY，相关信息可查看TuyaOpen授权码获取指南 | 
| 3 | tuya_ble_data_proc fail. | 使用了错误的授权码，请使用串口写入TuyaOpen授权码或修改config.h中的UUID和AUTH_KEY，相关信息可查看TuyaOpen授权码获取指南 |
| 4 | ACTIVE_OPEN_SDK_NOT_MATCHED | 未使用TuyaOpen授权码，相关信息可查看TuyaOpen授权码获取指南 |
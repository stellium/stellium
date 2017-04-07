import {SystemSettingsSchema} from "../schemas/system_settings";

export function getSettingsByKey(key: string, settings: SystemSettingsSchema[], returnValue = false): SystemSettingsSchema | any {

    const settingsItem = settings.find(_settings => _settings.key === key)

    return returnValue ? settingsItem && settingsItem.value : settingsItem
}
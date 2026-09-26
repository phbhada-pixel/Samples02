with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Initialize clientDengueEntries
old_init = "let clientVillageDetails = getLocalStore('villageDetails', null);"
new_init = (
    "let clientDengueEntries = getLocalStore('dengueChikungunyaEntries', null);\n"
    "      if (!clientDengueEntries || !Array.isArray(clientDengueEntries)) {\n"
    "        clientDengueEntries = (defaultSnap.dengueChikungunyaEntries && Array.isArray(defaultSnap.dengueChikungunyaEntries)) ? defaultSnap.dengueChikungunyaEntries : [];\n"
    "        if (clientDengueEntries.length > 0) setLocalStore('dengueChikungunyaEntries', clientDengueEntries);\n"
    "      }\n"
    "      let clientVillageDetails = getLocalStore('villageDetails', null);"
)

if "let clientDengueEntries" not in text and old_init in text:
    text = text.replace(old_init, new_init, 1)
    print("Added clientDengueEntries initialization!")

# 2. Add RPC cases in executeClientSideRpc
old_case = "          case 'getDrivePhotos': {"
dengue_cases = (
    "          case 'getDengueEntries': {\n"
    "            const [filterDate, filterVillage] = args;\n"
    "            let list = [...clientDengueEntries];\n"
    "            if (filterDate && filterDate !== 'All') list = list.filter(e => e.dateCollection === filterDate);\n"
    "            if (filterVillage && filterVillage !== 'All') list = list.filter(e => e.village === filterVillage);\n"
    "            return { result: { success: true, entries: list } };\n"
    "          }\n\n"
    "          case 'saveDengueEntry': {\n"
    "            const [entryData] = args;\n"
    "            const cleanDate = entryData.dateCollection ? String(entryData.dateCollection).trim() : new Date().toISOString().slice(0, 10);\n"
    "            const id = entryData.id || `DENGUE_${cleanDate.replace(/-/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;\n"
    "            const rec = { ...entryData, id, createdAt: entryData.createdAt || new Date().toISOString() };\n"
    "            const exIdx = clientDengueEntries.findIndex(e => e.id === id);\n"
    "            if (exIdx !== -1) clientDengueEntries[exIdx] = rec;\n"
    "            else clientDengueEntries.push(rec);\n"
    "            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);\n"
    "            return { result: { success: true, message: `रुग्ण ${rec.patientName} ची नोंद सुरक्षित सेव्ह झाली.`, record: rec } };\n"
    "          }\n\n"
    "          case 'updateDengueLabReport': {\n"
    "            const [repData] = args;\n"
    "            const exIdx = clientDengueEntries.findIndex(e => e.id === repData.id);\n"
    "            if (exIdx === -1) return { result: { success: false, message: 'रुग्ण नोंद सापडली नाही.' } };\n"
    "            const rec = { ...clientDengueEntries[exIdx], ...repData, updatedAt: new Date().toISOString() };\n"
    "            clientDengueEntries[exIdx] = rec;\n"
    "            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);\n"
    "            return { result: { success: true, message: `रुग्ण ${rec.patientName} चा प्रयोगशाळा अहवाल सुरक्षित सेव्ह झाला.`, record: rec } };\n"
    "          }\n\n"
    "          case 'deleteDengueEntry': {\n"
    "            const [id] = args;\n"
    "            const exIdx = clientDengueEntries.findIndex(e => e.id === id);\n"
    "            if (exIdx !== -1) clientDengueEntries.splice(exIdx, 1);\n"
    "            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);\n"
    "            return { result: { success: true, message: 'नोंद यशस्वीरित्या हटवली.' } };\n"
    "          }\n\n"
    "          case 'getDrivePhotos': {"
)

if "case 'updateDengueLabReport':" not in text and old_case in text:
    text = text.replace(old_case, dengue_cases, 1)
    print("Added dengue cases to executeClientSideRpc!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectClientDengueStore.py!")

import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { WhatsAppImport } from './WhatsAppImport'
import { TelegramImport } from './TelegramImport'

type ImportTab = 'whatsapp' | 'telegram'

export function ImportConversations() {
  const [activeTab, setActiveTab] = useState<ImportTab>('whatsapp')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Importar Conversaciones
        </h1>
        <p className="text-gray-600">
          Importa el historial de chat desde WhatsApp
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'whatsapp'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>
          {/* <button */}
          {/*   onClick={() => setActiveTab('telegram')} */}
          {/*   className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${ */}
          {/*     activeTab === 'telegram' */}
          {/*       ? 'text-gray-900 border-b-2 border-gray-900' */}
          {/*       : 'text-gray-500 hover:text-gray-700' */}
          {/*   }`} */}
          {/* > */}
          {/*   <Send size={20} /> */}
          {/*   Telegram */}
          {/* </button> */}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'whatsapp' && <WhatsAppImport />}
        </div>
      </div>
    </div>
  )
}

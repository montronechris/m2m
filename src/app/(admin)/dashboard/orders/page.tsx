// ... nel return della dashboard orders ...

<div className="space-y-6 p-6 bg-gray-50 min-h-screen">
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
      <span className="w-2 h-8 bg-green-600 rounded-full"></span>
      Ordini in Tempo Reale
    </h2>
    <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm animate-pulse">
      ● Live
    </Badge>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {orders.map((order) => (
      <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden">
        <div className={`h-1.5 w-full ${
          order.status === 'pending' ? 'bg-yellow-400' :
          order.status === 'preparing' ? 'bg-blue-500' :
          order.status === 'ready' ? 'bg-green-500' :
          'bg-gray-300'
        }`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-gray-900">Tavolo {order.table_id?.slice(-4) || '?'}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <Badge variant={order.status === 'served' ? 'secondary' : 'default'} className={
               order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
               order.status === 'preparing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
               order.status === 'ready' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
               'bg-gray-100 text-gray-800'
            }>
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                <span className="font-medium text-gray-700">{item.quantity}x {item.menu_item_id?.slice(0,8)}...</span>
                <span className="text-gray-900 font-semibold">{(item.unit_price_cents * item.quantity / 100).toFixed(2)}€</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-orange-50 text-orange-800 text-xs p-2.5 rounded-lg border border-orange-100 flex gap-2">
              <span>📝</span> {order.notes}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="font-bold text-xl text-gray-900">
              {(order.total_cents / 100).toFixed(2)}€
            </div>
            
            <select 
              value={order.status} 
              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
            >
              <option value="pending">⏳ In attesa</option>
              <option value="preparing">👨‍🍳 Preparazione</option>
              <option value="ready">✅ Pronto</option>
              <option value="served">🍽️ Servito</option>
              <option value="cancelled">❌ Annullato</option>
            </select>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
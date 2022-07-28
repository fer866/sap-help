using LiteDB;
using System;

namespace SAPHelp.Entities.Account
{
    public class BinnacleEntity
    {
        [BsonId]
        public ObjectId ID { get; set; }
        public string Action { get; set; }
        public string Object { get; set; }
        public DateTime ActionDate { get; set; }
    }
}

using MindPlaceClient.MindPlaceApiService;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MindPlaceClient.Dtos
{
    public class NewComment : CommentDto
    {
        [Required]
        public int questionId { get; set; }
    }
}

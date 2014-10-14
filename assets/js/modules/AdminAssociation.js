(function(xtens, AdminAssociation) {


    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;

       AdminAssociation.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'adminAssociation',

        events :{'drop #associated':'associate',
            'drop #noassociated':'dissociate',
            'dragover #associated':'enableDrop',
            'dragover #noassociated':'enableDrop',
            'dragstart .nondominant':'drag'

        },

        initialize: function(options) {
             $("#main").html(this.el);
            this.template = JST["views/templates/association.ejs"];
            this.dominant = options.dominant;
            this.nondominant = options.nondominant; 
            this.nondominantName = options.nondominantName;
            this.field = options.field;
            this.render();
        },

        render: function()  {
               
                this.$el.html(this.template({__: i18n, dominant:this.dominant,nondominants:this.nondominant,nondominantName:this.nondominantName,field:this.field}));
                return this;
           
            },

            
            associate : function(ev){

                ev.preventDefault();
                var idToAssociate=ev.originalEvent.dataTransfer.getData("Text");
                ev.target.appendChild(document.getElementById(idToAssociate));
                var nondominants = this.dominant.get(this.nondominantName);
                nondominants.push(idToAssociate/1000);
                this.dominant.set({nondominantName:nondominants});
                this.dominant.save(null,{
                    success:function(result){console.log(result);},
                    error:function(err){console.log(err);}
                });
                                   
            },

            dissociate :function(ev){

                ev.preventDefault();
                var idToDissociate=ev.originalEvent.dataTransfer.getData("Text");
                ev.target.appendChild(document.getElementById(idToDissociate));
                var id_grp = parseInt(document.URL.split("/")[6]);
                var nondominants = this.dominant.get(this.nondominantName);
                nondominants.pop(idToDissociate/1000);
                this.dominant.set({nondominantName:nondominants});
                this.dominant.save(null,{
                    success:function(result){console.log(result);},
                    error:function(err){console.log(err);}
                });
             },

            enableDrop : function(ev)
            {
                ev.preventDefault();
            },

            drag :function(ev)
            {
                ev.originalEvent.dataTransfer.setData("text",ev.target.id);

            }

    });


} (xtens, xtens.module("adminassociation")));

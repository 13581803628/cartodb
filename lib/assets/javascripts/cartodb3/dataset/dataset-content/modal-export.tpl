<div class="js-start">
  <div class="Dialog-header u-inner">
    <div class="Dialog-headerIcon Dialog-headerIcon--neutral">
      <i class="CDB-IconFont CDB-IconFont-cloudDownArrow"></i>
    </div>
    <p class="Dialog-headerTitle">Export dataset</p>
    <p class="Dialog-headerText">Select the preferred file format.</p>
    <% if (!isGeoreferenced) { %>
      <p class="Dialog-headerText">To download any geospatial format like SHP, KML or GeoJSON don't forget to select the_geom on your query.</p>
    <% } %>
  </div>

  <div class="Dialog-body">
    <div class="OptionCards">
      <% _.each( formats, function( format ){ %>
       <div data-format="<%- format.format %>"
            class="js-option OptionCard OptionCard--onlyIcons <%
              if (isGeoreferenced === false && format.geomRequired === true) { %> is-disabled <% }
            %>">
         <div class="IllustrationIcon <%- format.illustrationIconModifier %>">
           <div class="IllustrationIcon-text"><%- format.label || format.format %></div>
         </div>
       </div>
      <% }); %>
    </div>
  </div>

  <div class="Dialog-footer Dialog-footer--simple u-inner">
    <button class="cancel Button Button--secondary Dialog-footerBtn">
      <span>cancel</span>
    </button>
  </div>
</div>

<div class="js-preparing-download" style="display: none;">
  <%- preparingDownloadContent %>
</div>

<form class="js-form" method="POST" action="<%- url %>">
  <input type="hidden" class="js-filename" name="filename" />
  <input type="hidden" class="js-q" name="q" />
  <input type="hidden" class="js-format" name="format" />
  <input type="hidden" class="js-apiKey" name="api_key" />
  <input type="hidden" class="js-skipfields" name="skipfields" disabled="disabled" value="" />
  <input type="hidden" class="js-dp" name="dp" value="4" disabled="disabled" />
</form>

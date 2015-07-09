import UrlMapper from '../../src/url-mapper.js';

describe('url mapper', function() {
  const update = sinon.spy();

  let urlMapper;
  let dbMock;
  beforeEach(function() {
    dbMock = {
      find: function() {
      },
      insert: function() {
      },
      remove: function() {
      },
      count: function() {
      }
    };

    sinon.stub(dbMock);

    dbMock.remove.callsArg(2);

    urlMapper = new UrlMapper(dbMock, update);
  });

  describe('set', function() {
    it('saves mapped urls to the database', function() {
      const url = 'http://foo.com/bar/baz';
      const newUrl = 'http://foo.com/bar/mapped';
      const isLocal = false;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );

      expect(dbMock.insert).toHaveBeenCalledWith({
        url,
        newUrl,
        isLocal
      });
    });

    it('removes existing urls before adding them', function() {
      const url = 'http://foo.com/bar/baz';
      const newUrl = 'http://foo.com/bar/mapped';
      const isLocal = false;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );

      expect(dbMock.remove).toHaveBeenCalledWith({url});
    });

    it('adds a slash to `newUrl` when the url has no path and no slash at the end', function() {
      const url = 'http://foo.com/bar/baz';
      const newUrl = 'http://foo.com';
      const isLocal = false;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );

      expect(dbMock.insert).toHaveBeenCalledWith({
        url,
        newUrl: 'http://foo.com/',
        isLocal
      });
    });

    it('does not add a slash when the path is local', function() {
      const url = 'http://foo.com/bar/baz';
      const newUrl = 'foo/bar';
      const isLocal = true;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );

      expect(dbMock.insert).toHaveBeenCalledWith({
        url,
        newUrl: 'foo/bar',
        isLocal
      });
    });
  });

  describe('get', function() {
    let url;
    let newUrl;
    let isLocal;
    beforeEach(function() {
      url = 'http://foo.com/bar/baz';
      newUrl = 'foo/bar';
      isLocal = true;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
    });

    it('stores the mappings in the memory', function() {
      const mappedUrl = urlMapper.get(url);
      expect(mappedUrl).toEqual({
        url,
        newUrl,
        isLocal
      });
    });
  });

  describe('remove', function() {
    let url;
    let newUrl;
    let isLocal;
    beforeEach(function() {
      url = 'http://foo.com/bar/baz';
      newUrl = 'foo/bar';
      isLocal = true;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
    });

    it('removes mappings by passing the `newUrl`', function() {
      urlMapper.removeByNewUrl(newUrl);
      const mappedUrl = urlMapper.get(url);
      expect(mappedUrl).toEqual(undefined);
    });

    it('removes mappings by passing the `removeByNewUrl`', function() {
      urlMapper.remove(url);
      const mappedUrl = urlMapper.get(url);
      expect(mappedUrl).toEqual(undefined);
    });
  });

  describe('count', function() {
    let url;
    let newUrl;
    let isLocal;
    beforeEach(function() {
      url = 'http://foo.com/bar/baz';
      newUrl = 'foo/bar';
      isLocal = true;
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
    });

    it('returns the number of urlMappings', function() {
      const count = urlMapper.getCount();
      expect(count).toEqual(1);
    });

    it('returns 1 after adding the same mapping twice', function() {
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
      const count = urlMapper.getCount();
      expect(count).toEqual(1);
    });

    it('returns 0 after removing a mapping', function() {
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
      urlMapper.remove(url);
      const count = urlMapper.getCount();
      expect(count).toEqual(0);
    });

    it('returns 0 after removing a mapping by new url', function() {
      urlMapper.set(
        url,
        newUrl,
        isLocal
      );
      urlMapper.removeByNewUrl(newUrl);
      const count = urlMapper.getCount();
      expect(count).toEqual(0);
    });
  });
});